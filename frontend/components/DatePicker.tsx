"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  defaultTime?: string; // "HH:MM" or "HH:MM:SS"
  className?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(
    d.getSeconds()
  )}`;
}

function parseTime(value: string): { h: number; m: number; s: number } | null {
  const parts = value.split(":").map((p) => Number(p));
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
  const [h, m, s = 0] = parts;
  return { h, m, s };
}

function combineDateAndTime(date: Date, time: string) {
  const parsed = parseTime(time);
  const next = new Date(date);
  if (!parsed) {
    next.setHours(0, 0, 0, 0);
    return next;
  }
  next.setHours(parsed.h, parsed.m, parsed.s, 0);
  return next;
}

export function DatePicker({
  value = null,
  onChange,
  defaultTime = "10:30:00",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value ?? undefined);
  const [time, setTime] = React.useState<string>(
    value ? formatTime(value) : defaultTime
  );

  const dateId = React.useId();
  const timeId = React.useId();

  React.useEffect(() => {
    setDate(value ?? undefined);
    setTime(value ? formatTime(value) : defaultTime);
  }, [value, defaultTime]);

  return (
    <div className={["flex gap-4", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={dateId}
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
                onChange?.(date ? combineDateAndTime(date, time) : null);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Input
          type="time"
          id={timeId}
          step="1"
          value={time}
          onChange={(e) => {
            const nextTime = e.target.value;
            setTime(nextTime);
            if (date) onChange?.(combineDateAndTime(date, nextTime));
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
