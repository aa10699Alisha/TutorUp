import React, { useState, useEffect } from "react";
import { getTutorUpcomingSessions, getTutorPastSessions } from "../../services/api";

function TutorSessions({ tutorId, onNavigate }) {
  // Handle attendance marking by tutor
  const { markAttendanceAsTutor } = require('../../services/api');
  const handleTutorMarkAttendance = async (studentId, slotId, attendedChecked) => {
    console.log('DEBUG FRONTEND: Sending to backend:', { studentId, slotId, attended: attendedChecked ? 'Yes' : 'No' });
    try {
      const result = await markAttendanceAsTutor(studentId, slotId, attendedChecked ? 'Yes' : 'No');
      if (result.success) {
        setPastSessions(prev => prev.map(session => {
          if (session.SlotID === slotId && session.StudentID === studentId) {
            return { ...session, Attended: attendedChecked ? 'Yes' : 'No' };
          }
          return session;
        }));
      } else {
        setError(result.error || 'Failed to update attendance.');
      }
    } catch (err) {
      setError('Failed to update attendance.');
    }
  };
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("Time");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [pastSortBy, setPastSortBy] = useState("Recent");
  const [showPastSortMenu, setShowPastSortMenu] = useState(false);

  const sortParamMap = {
    Time: "time",
    Course: "course",
    Status: "status",
  };

  const pastSortOptions = ["Recent", "Oldest", "Course", "Student"];

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId, sortBy]);

  const fetchSessions = async () => {
    try {
      const [upcomingResult, pastResult] = await Promise.all([
        getTutorUpcomingSessions(tutorId, sortParamMap[sortBy]),
        getTutorPastSessions(tutorId),
      ]);
      if (upcomingResult.success) {
        setUpcomingSessions(upcomingResult.data);
      }
      if (pastResult.success) {
        setPastSessions(pastResult.data);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSort = (label) => {
    setSortBy(label);
    setShowSortMenu(false);
  };

  const handleSelectPastSort = (label) => {
    setPastSortBy(label);
    setShowPastSortMenu(false);
  };

  // 🔹 Group UPCOMING sessions by SlotID (or date+time) and merge students
  const groupedUpcomingSessions = Object.values(
    upcomingSessions.reduce((acc, session) => {
      const groupKey =
        session.SlotID ||
        `${session.Date}-${session.StartTime}-${session.CourseName || ""}`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          ...session,
          _students: [], // { id, name }
        };
      }

      const tmpStudents = [];

      // Case 1: backend sends comma-separated StudentNames / StudentIDs
      if (session.StudentNames && session.StudentNames.trim() !== "") {
        const names = session.StudentNames.split(", ");
        const ids = session.StudentIDs ? session.StudentIDs.split("||") : [];
        names.forEach((name, idx) => {
          const id = ids[idx] || `${name}-${idx}`;
          tmpStudents.push({ id, name });
        });
      }
      // Case 2: one row per student
      else if (session.StudentName && session.StudentName.trim() !== "") {
        const id =
          session.StudentID ||
          session.StudentEmail ||
          session.StudentName;
        tmpStudents.push({ id, name: session.StudentName });
      }

      tmpStudents.forEach((stu) => {
        const already = acc[groupKey]._students.some(
          (s) => s.id === stu.id && s.name === stu.name
        );
        if (!already) {
          acc[groupKey]._students.push(stu);
        }
      });

      return acc;
    }, {})
  );

  // 🔹 Group PAST sessions by SlotID (or date+time) and merge students + their attendance/reviews
  // First group by slot, then sort the grouped array
  const groupedPastSessionsMap = pastSessions.reduce((acc, session) => {
    const groupKey =
      session.SlotID ||
      `${session.Date}-${session.StartTime}-${session.CourseName || ""}`;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        ...session,
        _students: [], // { id, name, attended, rating, comment }
      };
    }

    const tmpStudents = [];

    // Again handle both patterns: aggregated StudentNames or one row per student
    if (session.StudentNames && session.StudentNames.trim() !== "") {
      const names = session.StudentNames.split(", ");
      const ids = session.StudentIDs ? session.StudentIDs.split("||") : [];
      names.forEach((name, idx) => {
        const id = ids[idx] || `${name}-${idx}`;
        tmpStudents.push({
          id,
          studentId: ids[idx] || session.StudentID,
          slotId: session.SlotID,
          name,
          attended: session.Attended || session.AttendedStatus,
          rating: session.Rating,
          comment: session.Comment,
        });
      });
    } else if (session.StudentName && session.StudentName.trim() !== "") {
      const id =
        session.StudentID ||
        session.StudentEmail ||
        session.StudentName;
      tmpStudents.push({
        id,
        studentId: session.StudentID,
        slotId: session.SlotID,
        name: session.StudentName,
        attended: session.Attended || session.AttendedStatus,
        rating: session.Rating,
        comment: session.Comment,
      });
    }

    tmpStudents.forEach((stu) => {
      const already = acc[groupKey]._students.some(
        (s) => s.id === stu.id && s.name === stu.name
      );
      if (!already) {
        acc[groupKey]._students.push(stu);
      }
    });

    return acc;
  }, {});

  // Now sort the grouped past sessions based on the selected sort option
  const groupedPastSessions = Object.values(groupedPastSessionsMap).sort((a, b) => {
    if (pastSortBy === "Recent") {
      const dateStrA = a.Date.split("T")[0];
      const dateStrB = b.Date.split("T")[0];
      const dateA = new Date(`${dateStrA} ${a.StartTime}`);
      const dateB = new Date(`${dateStrB} ${b.StartTime}`);
      return dateB - dateA; // Most recent first
    } else if (pastSortBy === "Oldest") {
      const dateStrA = a.Date.split("T")[0];
      const dateStrB = b.Date.split("T")[0];
      const dateA = new Date(`${dateStrA} ${a.StartTime}`);
      const dateB = new Date(`${dateStrB} ${b.StartTime}`);
      return dateA - dateB; // Oldest first
    } else if (pastSortBy === "Course") {
      return (a.CourseName || "").localeCompare(b.CourseName || "");
    } else if (pastSortBy === "Student") {
      // Sort by first student's name in the group
      const nameA = a._students[0]?.name || "";
      const nameB = b._students[0]?.name || "";
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  if (loading) {
    return <div className="loading">Loading sessions...</div>;
  }

  return (
    <div className="page-container">
      <h2>My Tutoring Sessions</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Upcoming Sessions Header + Sort */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ margin: 0 }}>Upcoming Sessions</h3>
        <div className="feed-main-sort-container" style={{ maxWidth: "220px" }}>
          <button
            className="feed-main-sort-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSortMenu(!showSortMenu);
            }}
          >
            Sort: {sortBy} ▼
          </button>
          {showSortMenu && (
            <div className="feed-main-sort-menu">
              {["Time", "Course", "Status"].map((opt) => (
                <div
                  key={opt}
                  className="feed-main-sort-option"
                  onClick={() => handleSelectSort(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Sessions List (grouped by slot) */}
      {groupedUpcomingSessions.length === 0 ? (
        <div className="empty-state">No upcoming sessions</div>
      ) : (
        <div className="list-container">
          {groupedUpcomingSessions.map((session, index) => {
            const students = session._students || [];
            const sessionKey = `${session.SlotID || "slot"}-${
              session.Date
            }-${session.StartTime}-${index}`;

            return (
              <div key={sessionKey} className="list-item">
                <h4>{session.CourseName}</h4>
                <p>
                  <strong>Date:</strong> {session.Date}
                </p>
                <p>
                  <strong>Time:</strong> {session.StartTime} - {session.EndTime}
                </p>
                <p>
                  <strong>Location:</strong> {session.Location}
                </p>
                <p>
                  <strong>Status:</strong> {session.Status}
                </p>
                <div>
                  <strong>Students:</strong>
                  {students.length > 0 ? (
                    <ul
                      style={{
                        margin: "6px 0 0 0",
                        paddingLeft: 18,
                      }}
                    >
                      {students.map((stu) => (
                        <li key={stu.id}>{stu.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ marginLeft: 8 }}>No students booked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Sessions Header + Sort */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginTop: "40px",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ margin: 0 }}>Past Sessions</h3>
        <div className="feed-main-sort-container" style={{ maxWidth: "220px" }}>
          <button
            className="feed-main-sort-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPastSortMenu(!showPastSortMenu);
            }}
          >
            Sort: {pastSortBy} ▼
          </button>
          {showPastSortMenu && (
            <div className="feed-main-sort-menu">
              {pastSortOptions.map((opt) => (
                <div
                  key={opt}
                  className="feed-main-sort-option"
                  onClick={() => handleSelectPastSort(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Past Sessions List (grouped by slot) */}
      {groupedPastSessions.length === 0 ? (
        <div className="empty-state">No past sessions</div>
      ) : (
        <div className="list-container">
          {groupedPastSessions.map((session, index) => {
            const students = session._students || [];
            const pastKey = `${session.SlotID || "booking"}-${
              session.Date
            }-${session.StartTime}-${index}`;

            return (
              <div key={pastKey} className="list-item">
                <h4>{session.CourseName}</h4>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(session.Date + 'T00:00:00').toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {session.StartTime} - {session.EndTime}
                </p>
                <p>
                  <strong>Location:</strong> {session.Location}
                </p>

                <div>
                  <strong>Students:</strong>
                  {students.length > 0 ? (
                    <ul
                      style={{
                        margin: "6px 0 0 0",
                        paddingLeft: 18,
                      }}
                    >
                      {students.map((stu, stuIndex) => (
                        <li 
                          key={stu.id}
                          style={{
                            marginBottom: students.length > 1 ? "16px" : "0",
                            paddingBottom: students.length > 1 && stuIndex < students.length - 1 ? "16px" : "0",
                            borderBottom: students.length > 1 && stuIndex < students.length - 1 ? "1px solid #e0e0e0" : "none"
                          }}
                        >
                          <div>
                            <strong>{stu.name}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <strong>Attended:</strong>{" "}
                            <input
                              type="checkbox"
                              checked={stu.attended === 'Yes'}
                              disabled={stu.attended === 'Yes' || stu.attended === 'No'}
                              onChange={e => handleTutorMarkAttendance(
                                stu.studentId,
                                stu.slotId,
                                e.target.checked
                              )}
                              style={{
                                cursor: stu.attended === 'Yes' || stu.attended === 'No' ? 'not-allowed' : 'pointer'
                              }}
                            />
                          </div>
                          {stu.rating && (
                            <div
                              style={{
                                marginTop: "8px",
                                background: "#e8f5e9",
                                padding: "8px",
                                borderRadius: "4px",
                              }}
                            >
                              <strong>Review:</strong> {stu.rating}/5
                              {stu.comment && (
                                <span> – {stu.comment}</span>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ marginLeft: 8 }}>
                      No students recorded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TutorSessions;
