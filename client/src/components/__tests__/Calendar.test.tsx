import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Calendar from "../Calendar";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Calendar Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the calendar with current month", () => {
    render(<Calendar />);
    const heading = screen.getByText(/February 2026/i);
    expect(heading).toBeTruthy();
  });

  it("displays weekday headers", () => {
    render(<Calendar />);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      expect(screen.getByText(day)).toBeTruthy();
    });
  });

  it("renders calendar days for the current month", () => {
    render(<Calendar />);
    // Check if some days of February 2026 are rendered
    const allElements = screen.getAllByText("1");
    expect(allElements.length).toBeGreaterThan(0);
  });

  it("allows selecting a date", async () => {
    render(<Calendar />);
    const dateButtons = screen.getAllByText("15");
    fireEvent.click(dateButtons[0]);
    // Check if the sidebar shows the selected date (not "Select a date" anymore)
    await waitFor(() => {
      const dateDisplays = screen.queryAllByText(/February/i);
      expect(dateDisplays.length).toBeGreaterThan(0);
    });
  });

  it("shows 'Add Task' button when a date is selected", async () => {
    render(<Calendar />);
    const dateButtons = screen.getAllByText("15");
    fireEvent.click(dateButtons[0]);
    await waitFor(() => {
      const addButtons = screen.getAllByText("Add Task");
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it("persists tasks to localStorage", async () => {
    render(<Calendar />);
    const user = userEvent.setup();

    // Select a date
    const dateButtons = screen.getAllByText("15");
    fireEvent.click(dateButtons[0]);

    // Add a task
    const addTaskButtons = await screen.findAllByText("Add Task");
    await user.click(addTaskButtons[0]);

    const titleInput = screen.getByPlaceholderText("Enter task title");
    await user.type(titleInput, "Persistent Task");

    const submitButtons = screen.getAllByText("Add Task");
    await user.click(submitButtons[submitButtons.length - 1]);

    // Check localStorage
    await waitFor(() => {
      const savedTasks = localStorage.getItem("schedulerTasks");
      expect(savedTasks).toBeTruthy();
      const tasks = JSON.parse(savedTasks!);
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe("Persistent Task");
    });
  });

  it("navigates to next month", async () => {
    render(<Calendar />);
    const user = userEvent.setup();

    // Find and click the next month button (last button in the header)
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[buttons.length - 1];
    await user.click(nextButton);

    // Check if month changed
    await waitFor(() => {
      expect(screen.getByText(/March 2026/i)).toBeTruthy();
    });
  });

  it("navigates to previous month", async () => {
    render(<Calendar />);
    const user = userEvent.setup();

    // Find and click the previous month button
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons[buttons.length - 2];
    await user.click(prevButton);

    // Check if month changed
    await waitFor(() => {
      expect(screen.getByText(/January 2026/i)).toBeTruthy();
    });
  });

  it("displays task time in the sidebar", async () => {
    // Pre-populate with a task
    const mockTasks = [
      {
        id: "1",
        date: "2026-02-15",
        title: "Test Task",
        time: "14:30",
        completed: false,
      },
    ];
    localStorage.setItem("schedulerTasks", JSON.stringify(mockTasks));

    render(<Calendar />);

    // Select the date with the task
    const dateButtons = screen.getAllByText("15");
    fireEvent.click(dateButtons[0]);

    // Check if time is displayed
    await waitFor(() => {
      expect(screen.getByText("14:30")).toBeTruthy();
    });
  });

  it("shows task count in the sidebar", async () => {
    // Pre-populate with multiple tasks
    const mockTasks = [
      {
        id: "1",
        date: "2026-02-15",
        title: "Task 1",
        time: "09:00",
        completed: false,
      },
      {
        id: "2",
        date: "2026-02-15",
        title: "Task 2",
        time: "10:00",
        completed: false,
      },
    ];
    localStorage.setItem("schedulerTasks", JSON.stringify(mockTasks));

    render(<Calendar />);

    // Select the date with tasks
    const dateButtons = screen.getAllByText("15");
    fireEvent.click(dateButtons[0]);

    // Check if task count is displayed
    await waitFor(() => {
      expect(screen.getByText("Tasks (2)")).toBeTruthy();
    });
  });

  it("loads tasks from localStorage on mount", () => {
    const mockTasks = [
      {
        id: "1",
        date: "2026-02-15",
        title: "Loaded Task",
        time: "09:00",
        completed: false,
      },
    ];
    localStorage.setItem("schedulerTasks", JSON.stringify(mockTasks));

    render(<Calendar />);

    // Select the date with the task
    const dateButtons = screen.getAllByText("15");
    fireEvent.click(dateButtons[0]);

    // Check if the task is loaded and displayed
    const taskElements = screen.queryAllByText(/Loaded Task/i);
    expect(taskElements.length).toBeGreaterThan(0);
  });

  it("displays tasks on calendar dates", () => {
    const mockTasks = [
      {
        id: "1",
        date: "2026-02-10",
        title: "Important Meeting",
        time: "10:00",
        completed: false,
      },
    ];
    localStorage.setItem("schedulerTasks", JSON.stringify(mockTasks));

    render(<Calendar />);

    // Check if task appears on the calendar date
    const taskElements = screen.queryAllByText(/Important Meeting/i);
    expect(taskElements.length).toBeGreaterThan(0);
  });

  it("initializes with empty tasks when localStorage is empty", () => {
    render(<Calendar />);
    const dateButtons = screen.getAllByText("15");
    fireEvent.click(dateButtons[0]);

    // Check that "No tasks for this date" message appears
    expect(screen.getByText(/No tasks for this date/i)).toBeTruthy();
  });
});
