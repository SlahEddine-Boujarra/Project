import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";

interface Task {
  id: string;
  date: string;
  title: string;
  time: string;
  completed: boolean;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("09:00");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("schedulerTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("schedulerTasks", JSON.stringify(tasks));
  }, [tasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days from previous month to fill the grid
  const startDate = monthStart.getDay() === 0 ? new Date(monthStart.getTime() - 6 * 24 * 60 * 60 * 1000) : new Date(monthStart.getTime() - (monthStart.getDay() - 1) * 24 * 60 * 60 * 1000);
  const calendarDays = eachDayOfInterval({ start: startDate, end: new Date(monthEnd.getTime() + (6 - monthEnd.getDay()) * 24 * 60 * 60 * 1000) });

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasks.filter((task) => task.date === dateStr);
  };

  const addTask = () => {
    if (!selectedDate || !newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      date: format(selectedDate, "yyyy-MM-dd"),
      title: newTaskTitle,
      time: newTaskTime,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskTime("09:00");
    setIsDialogOpen(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {format(currentDate, "MMMM yyyy")}
              </h1>
              <p className="text-blue-100 mt-1">Manage your daily tasks</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={prevMonth}
                variant="outline"
                size="icon"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={nextMonth}
                variant="outline"
                size="icon"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const dayTasks = getTasksForDate(day);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-24 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : isToday
                        ? "border-blue-300 bg-blue-50"
                        : isCurrentMonth
                        ? "border-gray-200 bg-white hover:border-gray-300"
                        : "border-gray-100 bg-gray-50"
                    } ${!isCurrentMonth ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        isToday ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.completed
                              ? "bg-gray-200 text-gray-500 line-through"
                              : "bg-blue-100 text-blue-700"
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Task Details */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d")
                    : "Select a date"}
                </h2>

                {selectedDate && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Task Title
                          </label>
                          <Input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="mt-1"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") addTask();
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Time
                          </label>
                          <Input
                            type="time"
                            value={newTaskTime}
                            onChange={(e) => setNewTaskTime(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={addTask}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Add Task
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Tasks ({getTasksForDate(selectedDate || new Date()).length})
                </h3>
                {selectedDate &&
                  getTasksForDate(selectedDate).length > 0 ? (
                  getTasksForDate(selectedDate)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border transition-all ${
                          task.completed
                            ? "bg-gray-50 border-gray-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className={`mt-1 p-1 rounded transition-colors ${
                              task.completed
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-400 hover:bg-green-500 hover:text-white"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                task.completed
                                  ? "text-gray-500 line-through"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              {task.time}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                ) : selectedDate ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No tasks for this date
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Select a date to view tasks
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
