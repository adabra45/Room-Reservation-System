import React, { useState, useEffect } from "react";
import "./App.css";

const floors = Array.from({ length: 10 }, (_, i) => {
  if (i < 9) return Array.from({ length: 10 }, (_, j) => (i + 1) * 100 + j + 1);
  return Array.from({ length: 7 }, (_, j) => 1000 + j + 1);
});

function App() {
  const [availableRooms, setAvailableRooms] = useState({});
  const [bookedRooms, setBookedRooms] = useState([]);
  const [numRooms, setNumRooms] = useState(1);
  const [totalTravelTime, setTotalTravelTime] = useState(0);

  // Initialize with all rooms available
  useEffect(() => {
    resetBooking();
  }, []);

  const resetBooking = () => {
    const newAvailable = {};
    floors.forEach((floorRooms) => {
      floorRooms.forEach((room) => {
        newAvailable[room] = true;
      });
    });
    setAvailableRooms(newAvailable);
    setBookedRooms([]);
    setTotalTravelTime(0);
  };

  const generateRandomOccupancy = () => {
    const newAvailable = { ...availableRooms };
    const allRooms = Object.keys(newAvailable);
    allRooms.forEach((room) => {
      newAvailable[room] = Math.random() > 0.2; // 80% chance room is available
    });
    setAvailableRooms(newAvailable);
    setBookedRooms([]);
    setTotalTravelTime(0);
  };

  const bookRooms = () => {
    const required = parseInt(numRooms);
    if (required < 1 || required > 5) {
      alert("Can only book 1 to 5 rooms!");
      return;
    }

    // Try each floor to find enough rooms on same floor
    for (let i = 0; i < floors.length; i++) {
      const floorRooms = floors[i].filter((room) => availableRooms[room]);
      if (floorRooms.length >= required) {
        const selected = floorRooms.slice(0, required);
        updateBooking(selected);
        return;
      }
    }

    // If not enough on one floor, find combination minimizing travel time
    let best = null;
    let minTime = Infinity;
    const allAvailable = Object.keys(availableRooms).filter((r) => availableRooms[r]);

    function combinations(arr, k) {
      if (k === 0) return [[]];
      if (arr.length === 0) return [];
      const [first, ...rest] = arr;
      return [
        ...combinations(rest, k - 1).map((comb) => [first, ...comb]),
        ...combinations(rest, k)
      ];
    }

    const allCombs = combinations(allAvailable, required);
    allCombs.forEach((comb) => {
      const time = calculateTravelTime(comb);
      if (time < minTime) {
        minTime = time;
        best = comb;
      }
    });

    if (best) {
      updateBooking(best);
    } else {
      alert("Not enough rooms available to book!");
    }
  };

  const calculateTravelTime = (rooms) => {
    if (rooms.length <= 1) return 0;
    const coords = rooms.map((r) => {
      const floor = Math.floor(r / 100) - 1;
      const posOnFloor = (r % 100) - 1;
      return [floor, posOnFloor];
    });

    let minFloor = Math.min(...coords.map(([f]) => f));
    let maxFloor = Math.max(...coords.map(([f]) => f));
    let minPos = Math.min(...coords.map(([_, p]) => p));
    let maxPos = Math.max(...coords.map(([_, p]) => p));

    const vertical = (maxFloor - minFloor) * 2;
    const horizontal = maxPos - minPos;
    return vertical + horizontal;
  };

  const updateBooking = (selected) => {
    const newAvailable = { ...availableRooms };
    selected.forEach((room) => {
      newAvailable[room] = false;
    });
    setAvailableRooms(newAvailable);
    setBookedRooms(selected);
    setTotalTravelTime(calculateTravelTime(selected));
  };

  return (
    <div className="container">
      <h1>Hotel Room Booking</h1>

      <div className="controls">
        <label>
          Number of rooms (1-5):
          <input
            type="number"
            min="1"
            max="5"
            value={numRooms}
            onChange={(e) => setNumRooms(e.target.value)}
          />
        </label>
        <button onClick={bookRooms}>Book Rooms</button>
        <button onClick={generateRandomOccupancy}>Random Occupancy</button>
        <button onClick={resetBooking}>Reset Booking</button>
      </div>

      <div className="hotel">
        {floors
          .map((floorRooms, i) => (
            <div className="floor" key={i}>
              <div className="floor-label">Floor {i + 1}</div>
              <div className="rooms">
                {floorRooms.map((room) => (
                  <div
                    key={room}
                    className={`room ${
                      !availableRooms[room] ? "occupied" : bookedRooms.includes(room) ? "booked" : "available"
                    }`}
                  >
                    {room}
                  </div>
                ))}
              </div>
            </div>
          ))
          .reverse()}
      </div>

      {bookedRooms.length > 0 && (
        <div className="summary">
          <p>Booked Rooms: {bookedRooms.join(", ")}</p>
          <p>Total Travel Time: {totalTravelTime} minutes</p>
        </div>
      )}
    </div>
  );
}

export default App;
