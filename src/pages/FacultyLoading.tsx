"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonList,
  IonSearchbar,
  IonChip,
  IonModal,
  IonInput,
  IonToggle,
  IonAlert,
  IonAvatar,
  IonImg,
  IonFooter,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSegmentButton,
  IonText,
} from "@ionic/react"
import { add, close, create, trash, save, time } from "ionicons/icons"
import { employees, departments, programs, positions } from "../data/data"

// Define schedule types
interface ScheduleEntry {
  id: string
  employeeId: string
  courseCode?: string
  courseName?: string
  roomNumber?: string
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  startTime: string
  endTime: string
  programId?: string
  departmentId: string
  semester: string
  academicYear: string
  isActive: boolean
  dateCreated: string
  createdBy: string
  dateModified?: string
  modifiedBy?: string
}

// Sample schedule data
const initialSchedules: ScheduleEntry[] = [
  {
    id: "1",
    employeeId: "4", // Jennifer Davis
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    roomNumber: "A-201",
    dayOfWeek: "Monday",
    startTime: "08:00",
    endTime: "10:00",
    programId: "1", // Computer Science
    departmentId: "1", // College of Computer Studies
    semester: "First",
    academicYear: "2023-2024",
    isActive: true,
    dateCreated: "2023-05-15",
    createdBy: "1", // HR Admin
  },
  {
    id: "2",
    employeeId: "4", // Jennifer Davis
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    roomNumber: "A-201",
    dayOfWeek: "Wednesday",
    startTime: "08:00",
    endTime: "10:00",
    programId: "1", // Computer Science
    departmentId: "1", // College of Computer Studies
    semester: "First",
    academicYear: "2023-2024",
    isActive: true,
    dateCreated: "2023-05-15",
    createdBy: "1", // HR Admin
  },
  {
    id: "3",
    employeeId: "5", // David Wilson
    courseCode: "IT201",
    courseName: "Database Management",
    roomNumber: "B-101",
    dayOfWeek: "Tuesday",
    startTime: "13:00",
    endTime: "16:00",
    programId: "2", // Information Technology
    departmentId: "1", // College of Computer Studies
    semester: "First",
    academicYear: "2023-2024",
    isActive: true,
    dateCreated: "2023-05-16",
    createdBy: "1", // HR Admin
  },
  {
    id: "4",
    employeeId: "6", // Sarah Anderson
    courseCode: "CS202",
    courseName: "Data Structures",
    roomNumber: "A-205",
    dayOfWeek: "Thursday",
    startTime: "10:00",
    endTime: "13:00",
    programId: "1", // Computer Science
    departmentId: "1", // College of Computer Studies
    semester: "First",
    academicYear: "2023-2024",
    isActive: true,
    dateCreated: "2023-05-17",
    createdBy: "1", // HR Admin
  },
  {
    id: "5",
    employeeId: "7", // James Taylor
    courseCode: "IT105",
    courseName: "Web Development",
    roomNumber: "B-205",
    dayOfWeek: "Friday",
    startTime: "14:00",
    endTime: "17:00",
    programId: "2", // Information Technology
    departmentId: "1", // College of Computer Studies
    semester: "First",
    academicYear: "2023-2024",
    isActive: true,
    dateCreated: "2023-05-18",
    createdBy: "1", // HR Admin
  },
  {
    id: "6",
    employeeId: "9", // Richard Martinez
    courseCode: "BA101",
    courseName: "Introduction to Business",
    roomNumber: "C-101",
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "12:00",
    programId: "3", // Business Administration
    departmentId: "2", // College of Business
    semester: "First",
    academicYear: "2023-2024",
    isActive: true,
    dateCreated: "2023-05-19",
    createdBy: "1", // HR Admin
  },
]

// Sample semesters and academic years
const semesters = ["First", "Second", "Summer"]
const academicYears = ["2022-2023", "2023-2024", "2024-2025"]

// Days of the week
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const FacultyLoading: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleEntry[]>([])
  const [searchText, setSearchText] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all")
  const [selectedDay, setSelectedDay] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "faculty">("list")
  const [showConflictAlert, setShowConflictAlert] = useState(false)
  const [conflictDetails, setConflictDetails] = useState<string>("")

  // Load schedules from localStorage or use initial data
  useEffect(() => {
    const savedSchedules = localStorage.getItem("hrims-faculty-schedules")
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules))
    } else {
      setSchedules(initialSchedules)
    }
  }, [])

  // Save schedules to localStorage when they change
  useEffect(() => {
    if (schedules.length > 0) {
      localStorage.setItem("hrims-faculty-schedules", JSON.stringify(schedules))
    }
  }, [schedules])

  // Filter schedules based on selected filters and search text
  useEffect(() => {
    let filtered = [...schedules]

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((schedule) => schedule.departmentId === selectedDepartment)
    }

    // Filter by program
    if (selectedProgram !== "all") {
      filtered = filtered.filter((schedule) => schedule.programId === selectedProgram)
    }

    // Filter by employee
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((schedule) => schedule.employeeId === selectedEmployee)
    }

    // Filter by semester
    if (selectedSemester !== "all") {
      filtered = filtered.filter((schedule) => schedule.semester === selectedSemester)
    }

    // Filter by academic year
    if (selectedAcademicYear !== "all") {
      filtered = filtered.filter((schedule) => schedule.academicYear === selectedAcademicYear)
    }

    // Filter by day of week
    if (selectedDay !== "all") {
      filtered = filtered.filter((schedule) => schedule.dayOfWeek === selectedDay)
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (schedule) =>
          schedule.courseCode?.toLowerCase().includes(searchLower) ||
          schedule.courseName?.toLowerCase().includes(searchLower) ||
          schedule.roomNumber?.toLowerCase().includes(searchLower) ||
          getEmployeeName(schedule.employeeId).toLowerCase().includes(searchLower),
      )
    }

    // Sort by day of week and start time
    filtered.sort((a, b) => {
      const dayOrder = daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek)
      if (dayOrder !== 0) return dayOrder
      return a.startTime.localeCompare(b.startTime)
    })

    setFilteredSchedules(filtered)
  }, [
    schedules,
    selectedDepartment,
    selectedProgram,
    selectedEmployee,
    selectedSemester,
    selectedAcademicYear,
    selectedDay,
    searchText,
  ])

  // Filter departments by type (Academic only)
  const academicDepartments = departments.filter((dept) => {
    // Check if any program belongs to this department
    return programs.some((prog) => prog.departmentId === dept.id)
  })

  // Filter programs by selected department
  const departmentPrograms =
    selectedDepartment !== "all" ? programs.filter((program) => program.departmentId === selectedDepartment) : programs

  // Filter academic employees
  const academicEmployees = employees.filter((emp) => {
    const position = positions.find((pos) => pos.id === emp.positionId)
    return position?.type === "Academic"
  })

  // Get employee name
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee"
  }

  // Get employee avatar
  const getEmployeeAvatar = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee?.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"
  }

  // Get department name
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId)
    return department ? department.name : "Unknown Department"
  }

  // Get program name
  const getProgramName = (programId?: string) => {
    if (!programId) return "N/A"
    const program = programs.find((prog) => prog.id === programId)
    return program ? program.name : "Unknown Program"
  }

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedDepartment("all")
    setSelectedProgram("all")
    setSelectedEmployee("all")
    setSelectedSemester("all")
    setSelectedAcademicYear("all")
    setSelectedDay("all")
    setSearchText("")
  }

  // Handle adding a new schedule
  const handleAddSchedule = () => {
    const newSchedule: ScheduleEntry = {
      id: Date.now().toString(),
      employeeId: "",
      dayOfWeek: "Monday",
      startTime: "08:00",
      endTime: "10:00",
      departmentId: "",
      semester: "First",
      academicYear: "2023-2024",
      isActive: true,
      dateCreated: new Date().toISOString().split("T")[0],
      createdBy: "1", // HR Admin
    }
    setCurrentSchedule(newSchedule)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  // Handle editing a schedule
  const handleEditSchedule = (schedule: ScheduleEntry) => {
    setCurrentSchedule({ ...schedule })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Handle deleting a schedule
  const handleDeleteSchedule = (schedule: ScheduleEntry) => {
    setCurrentSchedule(schedule)
    setShowDeleteAlert(true)
  }

  // Confirm delete schedule
  const confirmDeleteSchedule = () => {
    if (currentSchedule) {
      setSchedules(schedules.filter((s) => s.id !== currentSchedule.id))
      setAlertMessage("Schedule deleted successfully")
      setShowAlert(true)
    }
    setShowDeleteAlert(false)
  }

  // Check for schedule conflicts
  const checkScheduleConflicts = (schedule: ScheduleEntry): boolean => {
    // Skip conflict check for the same schedule (when editing)
    const otherSchedules = isEditing ? schedules.filter((s) => s.id !== schedule.id) : schedules

    // Check for conflicts with the same faculty member on the same day and overlapping time
    const conflicts = otherSchedules.filter((s) => {
      if (s.employeeId !== schedule.employeeId || s.dayOfWeek !== schedule.dayOfWeek) {
        return false
      }

      const scheduleStart = schedule.startTime
      const scheduleEnd = schedule.endTime
      const existingStart = s.startTime
      const existingEnd = s.endTime

      // Check if times overlap
      return (
        (scheduleStart >= existingStart && scheduleStart < existingEnd) ||
        (scheduleEnd > existingStart && scheduleEnd <= existingEnd) ||
        (scheduleStart <= existingStart && scheduleEnd >= existingEnd)
      )
    })

    if (conflicts.length > 0) {
      const conflictInfo = conflicts
        .map((c) => {
          return `${c.courseCode || "Unknown Course"} (${formatTime(c.startTime)} - ${formatTime(c.endTime)})`
        })
        .join(", ")

      setConflictDetails(`Conflicts with: ${conflictInfo}`)
      setShowConflictAlert(true)
      return true
    }

    return false
  }

  // Handle saving a schedule
  const handleSaveSchedule = () => {
    if (!currentSchedule) return

    // Validate schedule
    if (!currentSchedule.employeeId) {
      setAlertMessage("Please select an employee")
      setShowAlert(true)
      return
    }

    if (!currentSchedule.departmentId) {
      setAlertMessage("Please select a department")
      setShowAlert(true)
      return
    }

    if (!currentSchedule.startTime || !currentSchedule.endTime) {
      setAlertMessage("Please set start and end times")
      setShowAlert(true)
      return
    }

    // Check if end time is after start time
    if (currentSchedule.startTime >= currentSchedule.endTime) {
      setAlertMessage("End time must be after start time")
      setShowAlert(true)
      return
    }

    // Check for schedule conflicts
    if (checkScheduleConflicts(currentSchedule)) {
      return
    }

    if (isEditing) {
      // Update existing schedule
      setSchedules(
        schedules.map((s) =>
          s.id === currentSchedule.id
            ? {
                ...currentSchedule,
                dateModified: new Date().toISOString().split("T")[0],
                modifiedBy: "1", // HR Admin
              }
            : s,
        ),
      )
      setAlertMessage("Schedule updated successfully")
    } else {
      // Add new schedule
      setSchedules([...schedules, currentSchedule])
      setAlertMessage("New schedule added successfully")
    }

    setShowAlert(true)
    setIsModalOpen(false)
  }

  // Group schedules by faculty for faculty view
  const schedulesByFaculty = filteredSchedules.reduce(
    (acc, schedule) => {
      const employeeId = schedule.employeeId
      if (!acc[employeeId]) {
        acc[employeeId] = []
      }
      acc[employeeId].push(schedule)
      return acc
    },
    {} as Record<string, ScheduleEntry[]>,
  )

  // Calculate faculty load
  const calculateFacultyLoad = (employeeId: string) => {
    const facultySchedules = schedules.filter((s) => s.employeeId === employeeId)

    // Calculate total hours per week
    let totalHours = 0
    facultySchedules.forEach((schedule) => {
      const startHour = Number.parseInt(schedule.startTime.split(":")[0])
      const startMinute = Number.parseInt(schedule.startTime.split(":")[1])
      const endHour = Number.parseInt(schedule.endTime.split(":")[0])
      const endMinute = Number.parseInt(schedule.endTime.split(":")[1])

      const durationHours = endHour - startHour
      const durationMinutes = endMinute - startMinute

      totalHours += durationHours + durationMinutes / 60
    })

    return totalHours.toFixed(1)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Faculty Loading</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Faculty Schedule Management</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <IonSegment value={viewMode} onIonChange={(e) => setViewMode(e.detail.value as any)}>
                    <IonSegmentButton value="list">
                      <IonLabel>List View</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="calendar">
                      <IonLabel>Calendar View</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="faculty">
                      <IonLabel>Faculty View</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonSearchbar
                    value={searchText}
                    onIonChange={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search courses, faculty, or rooms"
                    animated
                  />
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" size-md="4">
                  <IonItem>
                    <IonLabel position="stacked">Department</IonLabel>
                    <IonSelect value={selectedDepartment} onIonChange={(e) => setSelectedDepartment(e.detail.value)}>
                      <IonSelectOption value="all">All Departments</IonSelectOption>
                      {academicDepartments.map((dept) => (
                        <IonSelectOption key={dept.id} value={dept.id}>
                          {dept.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>

                <IonCol size="12" size-md="4">
                  <IonItem>
                    <IonLabel position="stacked">Program</IonLabel>
                    <IonSelect
                      value={selectedProgram}
                      onIonChange={(e) => setSelectedProgram(e.detail.value)}
                      disabled={selectedDepartment === "all"}
                    >
                      <IonSelectOption value="all">All Programs</IonSelectOption>
                      {departmentPrograms.map((prog) => (
                        <IonSelectOption key={prog.id} value={prog.id}>
                          {prog.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>

                <IonCol size="12" size-md="4">
                  <IonItem>
                    <IonLabel position="stacked">Faculty</IonLabel>
                    <IonSelect value={selectedEmployee} onIonChange={(e) => setSelectedEmployee(e.detail.value)}>
                      <IonSelectOption value="all">All Faculty</IonSelectOption>
                      {academicEmployees.map((emp) => (
                        <IonSelectOption key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12" size-md="4">
                  <IonItem>
                    <IonLabel position="stacked">Semester</IonLabel>
                    <IonSelect value={selectedSemester} onIonChange={(e) => setSelectedSemester(e.detail.value)}>
                      <IonSelectOption value="all">All Semesters</IonSelectOption>
                      {semesters.map((sem) => (
                        <IonSelectOption key={sem} value={sem}>
                          {sem}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>

                <IonCol size="12" size-md="4">
                  <IonItem>
                    <IonLabel position="stacked">Academic Year</IonLabel>
                    <IonSelect
                      value={selectedAcademicYear}
                      onIonChange={(e) => setSelectedAcademicYear(e.detail.value)}
                    >
                      <IonSelectOption value="all">All Years</IonSelectOption>
                      {academicYears.map((year) => (
                        <IonSelectOption key={year} value={year}>
                          {year}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>

                <IonCol size="12" size-md="4">
                  <IonItem>
                    <IonLabel position="stacked">Day</IonLabel>
                    <IonSelect value={selectedDay} onIonChange={(e) => setSelectedDay(e.detail.value)}>
                      <IonSelectOption value="all">All Days</IonSelectOption>
                      {daysOfWeek.map((day) => (
                        <IonSelectOption key={day} value={day}>
                          {day}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow className="ion-margin-top">
                <IonCol>
                  <IonButton size="small" fill="outline" onClick={resetFilters}>
                    <IonIcon slot="start" icon={close} />
                    Reset Filters
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {viewMode === "list" && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Schedule List</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {filteredSchedules.length === 0 ? (
                  <div className="ion-text-center ion-padding">
                    <p>No schedules found matching your filters.</p>
                    <IonButton size="small" fill="outline" onClick={resetFilters}>
                      Reset Filters
                    </IonButton>
                  </div>
                ) : (
                  <IonList>
                    {filteredSchedules.map((schedule) => (
                      <IonItem key={schedule.id}>
                        <IonAvatar slot="start">
                          <IonImg src={getEmployeeAvatar(schedule.employeeId)} alt="Faculty" />
                        </IonAvatar>
                        <IonLabel>
                          <h2>{getEmployeeName(schedule.employeeId)}</h2>
                          <h3>
                            {schedule.courseCode} - {schedule.courseName}
                          </h3>
                          <p>
                            {schedule.dayOfWeek}, {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </p>
                          <p>
                            Room: {schedule.roomNumber} | {getProgramName(schedule.programId)}
                          </p>
                        </IonLabel>
                        <IonButton fill="clear" onClick={() => handleEditSchedule(schedule)}>
                          <IonIcon slot="icon-only" icon={create} />
                        </IonButton>
                        <IonButton fill="clear" color="danger" onClick={() => handleDeleteSchedule(schedule)}>
                          <IonIcon slot="icon-only" icon={trash} />
                        </IonButton>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}

        {viewMode === "calendar" && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Weekly Schedule</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {filteredSchedules.length === 0 ? (
                  <div className="ion-text-center ion-padding">
                    <p>No schedules found matching your filters.</p>
                    <IonButton size="small" fill="outline" onClick={resetFilters}>
                      Reset Filters
                    </IonButton>
                  </div>
                ) : (
                  <div className="weekly-calendar">
                    <IonGrid>
                      <IonRow>
                        <IonCol size="2">
                          <div className="time-column">
                            <div className="time-header">Time</div>
                            {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => (
                              <div key={hour} className="time-slot">
                                {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
                              </div>
                            ))}
                          </div>
                        </IonCol>
                        {daysOfWeek.map((day) => (
                          <IonCol key={day} size="2">
                            <div className="day-column">
                              <div className="day-header">{day}</div>
                              <div className="day-schedule">
                                {filteredSchedules
                                  .filter((schedule) => schedule.dayOfWeek === day)
                                  .map((schedule) => {
                                    const startHour = Number.parseInt(schedule.startTime.split(":")[0])
                                    const startMinute = Number.parseInt(schedule.startTime.split(":")[1])
                                    const endHour = Number.parseInt(schedule.endTime.split(":")[0])
                                    const endMinute = Number.parseInt(schedule.endTime.split(":")[1])

                                    const startPosition = (startHour - 7) * 60 + startMinute
                                    const duration = (endHour - startHour) * 60 + (endMinute - startMinute)

                                    return (
                                      <div
                                        key={schedule.id}
                                        className="schedule-item"
                                        style={{
                                          top: `${startPosition}px`,
                                          height: `${duration}px`,
                                          backgroundColor: "#3880ff",
                                          color: "white",
                                          padding: "4px",
                                          borderRadius: "4px",
                                          overflow: "hidden",
                                          position: "absolute",
                                          width: "90%",
                                          fontSize: "12px",
                                        }}
                                        onClick={() => handleEditSchedule(schedule)}
                                      >
                                        <div>{schedule.courseCode}</div>
                                        <div>{getEmployeeName(schedule.employeeId)}</div>
                                        <div>{schedule.roomNumber}</div>
                                      </div>
                                    )
                                  })}
                              </div>
                            </div>
                          </IonCol>
                        ))}
                      </IonRow>
                    </IonGrid>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}

        {viewMode === "faculty" && (
          <>
            {Object.keys(schedulesByFaculty).length === 0 ? (
              <IonCard>
                <IonCardContent className="ion-text-center ion-padding">
                  <p>No faculty schedules found matching your filters.</p>
                  <IonButton size="small" fill="outline" onClick={resetFilters}>
                    Reset Filters
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ) : (
              Object.entries(schedulesByFaculty).map(([employeeId, facultySchedules]) => {
                const employee = employees.find((emp) => emp.id === employeeId)
                if (!employee) return null

                return (
                  <IonCard key={employeeId}>
                    <IonCardHeader>
                      <IonGrid>
                        <IonRow className="ion-align-items-center">
                          <IonCol size="auto">
                            <IonAvatar>
                              <IonImg
                                src={employee.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                                alt={`${employee.firstName} ${employee.lastName}`}
                              />
                            </IonAvatar>
                          </IonCol>
                          <IonCol>
                            <IonCardTitle>
                              {employee.firstName} {employee.lastName}
                            </IonCardTitle>
                            <p>{positions.find((p) => p.id === employee.positionId)?.title || "Faculty"}</p>
                          </IonCol>
                          <IonCol size="auto">
                            <IonChip color="primary">
                              <IonIcon icon={time} />
                              <IonLabel>{calculateFacultyLoad(employeeId)} hours/week</IonLabel>
                            </IonChip>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {daysOfWeek.map((day) => {
                          const daySchedules = facultySchedules.filter((s) => s.dayOfWeek === day)
                          if (daySchedules.length === 0) return null

                          return (
                            <div key={day}>
                              <IonItem lines="none">
                                <IonLabel>
                                  <h2>{day}</h2>
                                </IonLabel>
                              </IonItem>
                              {daySchedules.map((schedule) => (
                                <IonItem key={schedule.id} button onClick={() => handleEditSchedule(schedule)}>
                                  <IonLabel>
                                    <h3>
                                      {schedule.courseCode} - {schedule.courseName}
                                    </h3>
                                    <p>
                                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                    </p>
                                    <p>
                                      Room: {schedule.roomNumber} | {getProgramName(schedule.programId)}
                                    </p>
                                  </IonLabel>
                                  <IonButton
                                    fill="clear"
                                    slot="end"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditSchedule(schedule)
                                    }}
                                  >
                                    <IonIcon slot="icon-only" icon={create} />
                                  </IonButton>
                                  <IonButton
                                    fill="clear"
                                    color="danger"
                                    slot="end"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteSchedule(schedule)
                                    }}
                                  >
                                    <IonIcon slot="icon-only" icon={trash} />
                                  </IonButton>
                                </IonItem>
                              ))}
                            </div>
                          )
                        })}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                )
              })
            )}
          </>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddSchedule}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Schedule Edit/Add Modal */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{isEditing ? "Edit Schedule" : "Add Schedule"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            {currentSchedule && (
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">
                    Faculty <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentSchedule.employeeId}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, employeeId: e.detail.value })}
                    placeholder="Select Faculty"
                  >
                    {academicEmployees.map((emp) => (
                      <IonSelectOption key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Department <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentSchedule.departmentId}
                    onIonChange={(e) => {
                      const newDept = e.detail.value
                      setCurrentSchedule({
                        ...currentSchedule,
                        departmentId: newDept,
                        programId: undefined, // Reset program when department
                      })
                    }}
                    placeholder="Select Department"
                  >
                    {academicDepartments.map((dept) => (
                      <IonSelectOption key={dept.id} value={dept.id}>
                        {dept.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Program</IonLabel>
                  <IonSelect
                    value={currentSchedule.programId}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, programId: e.detail.value })}
                    placeholder="Select Program"
                    disabled={!currentSchedule.departmentId}
                  >
                    {programs
                      .filter((prog) => prog.departmentId === currentSchedule.departmentId)
                      .map((prog) => (
                        <IonSelectOption key={prog.id} value={prog.id}>
                          {prog.name}
                        </IonSelectOption>
                      ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Course Code</IonLabel>
                  <IonInput
                    value={currentSchedule.courseCode}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, courseCode: e.detail.value! })}
                    placeholder="e.g., CS101"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Course Name</IonLabel>
                  <IonInput
                    value={currentSchedule.courseName}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, courseName: e.detail.value! })}
                    placeholder="e.g., Introduction to Programming"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Room Number</IonLabel>
                  <IonInput
                    value={currentSchedule.roomNumber}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, roomNumber: e.detail.value! })}
                    placeholder="e.g., A-101"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Day of Week <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentSchedule.dayOfWeek}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, dayOfWeek: e.detail.value })}
                  >
                    {daysOfWeek.map((day) => (
                      <IonSelectOption key={day} value={day}>
                        {day}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Start Time <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonInput
                    type="time"
                    value={currentSchedule.startTime}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, startTime: e.detail.value! })}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    End Time <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonInput
                    type="time"
                    value={currentSchedule.endTime}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, endTime: e.detail.value! })}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Semester <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentSchedule.semester}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, semester: e.detail.value })}
                  >
                    {semesters.map((sem) => (
                      <IonSelectOption key={sem} value={sem}>
                        {sem}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Academic Year <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentSchedule.academicYear}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, academicYear: e.detail.value })}
                  >
                    {academicYears.map((year) => (
                      <IonSelectOption key={year} value={year}>
                        {year}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel>Active</IonLabel>
                  <IonToggle
                    checked={currentSchedule.isActive}
                    onIonChange={(e) => setCurrentSchedule({ ...currentSchedule, isActive: e.detail.checked })}
                  />
                </IonItem>
              </IonList>
            )}
          </IonContent>

          <IonFooter>
            <IonToolbar>
              <IonButton expand="block" onClick={handleSaveSchedule}>
                <IonIcon icon={save} slot="start" />
                Save Schedule
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonModal>

        {/* Alerts */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notification"
          message={alertMessage}
          buttons={["OK"]}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Delete"
          message="Are you sure you want to delete this schedule?"
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Delete",
              handler: confirmDeleteSchedule,
            },
          ]}
        />

        <IonAlert
          isOpen={showConflictAlert}
          onDidDismiss={() => setShowConflictAlert(false)}
          header="Schedule Conflict"
          message={`This schedule conflicts with existing faculty schedules. ${conflictDetails}`}
          buttons={[
            {
              text: "OK",
              role: "cancel",
            },
          ]}
        />
      </IonContent>
    </IonPage>
  )
}

export default FacultyLoading
