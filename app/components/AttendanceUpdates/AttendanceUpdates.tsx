"use client";

import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import {
  getMonthAndYearFromDate,
  loadLatestAttendanceData,
  subscribeToAttendance,
} from "../functions/attendanceUtils";
import { AttendanceRecord } from "../types/attendanceTypes";
import AttendanceTable from "../AttendanceTable";

export const AttendanceUpdates = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    // Load attendance data on component mount
    loadLatestAttendanceData(setAttendanceData);

    // Subscribe to attendance data updates in real-time
    const unsubscribe = subscribeToAttendance(setAttendanceData);

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    // Process attendance data to extract months and years
    const uniqueMonths = new Set<string>();
    const uniqueYears = new Set<string>();

    attendanceData.forEach((record) => {
      console.log("record.date_mm_dd_yyyy " + record.date_mm_dd_yyyy);

      const result = getMonthAndYearFromDate(record.date_mm_dd_yyyy);
      console.log("result " + result);

      if (result !== "Unknown Date") {
        const [monthName, year] = result.split(" ");
        uniqueMonths.add(monthName); // Add month name
        uniqueYears.add(year); // Add year
      }
    });

    setMonths(Array.from(uniqueMonths)); // Update months state
    setYears(Array.from(uniqueYears)); // Update years state
  }, [attendanceData]);

  return (
    <div className="flex scale-95 flex-col items-center justify-center py-[14vw]">
      <h1 className="mb-2 text-[5vw] font-bold max-sm:text-[7vw]">
        Attendance Updates
      </h1>
      <div className="m-[3vw] flex w-full flex-col items-center justify-center rounded-3xl bg-accent py-[3vw]">
        <div className="m-2 flex gap-2">
          {/* Autocomplete for selecting a month */}
          <Autocomplete
            aria-label="input month"
            variant="bordered"
            defaultItems={months.map((month) => ({
              label: month,
              value: month,
            }))}
            placeholder="Month"
            className="w-[50vw] md:max-w-[25vw]"
            onSelectionChange={(key) => setSelectedMonth(key as string)} // Update selected month
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>

          {/* Autocomplete for selecting a year */}
          <Autocomplete
            aria-label="input year"
            variant="bordered"
            defaultItems={years.map((year) => ({ label: year, value: year }))}
            placeholder="Year"
            className="w-[40vw] md:max-w-[18vw]"
            onSelectionChange={(key) => setSelectedYear(key as string)} // Update selected year
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        {/* Display the selected month and year */}
        <h2 className="mt-1 text-[3vw] font-bold max-sm:text-[5vw]">
          {selectedMonth && selectedYear
            ? `${selectedMonth} ${selectedYear}`
            : "Select a Month and Year"}
        </h2>
        {selectedMonth && selectedYear ? (
          <AttendanceTable
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        ) : (
          <div className="flex w-full items-center justify-center"></div>
        )}
      </div>
      {/* Pass the converted month number and selected year as props */}
    </div>
  );
};
