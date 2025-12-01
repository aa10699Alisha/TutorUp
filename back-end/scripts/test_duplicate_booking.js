const { pool } = require('../config/database');

/**
 * Attempt to insert two bookings for the same student+slot.
 */

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node test_duplicate_booking.js <slotId> <studentId>');
    process.exit(1);
  }

  const [slotId, studentId] = args;
  let connection;

  try {
    connection = await pool.getConnection();

    console.log('Attempting first insert...');
    const [r1] = await connection.query(
      'INSERT INTO Booking (Status, SlotID, StudentID) VALUES (?, ?, ?)',
      ['Confirmed', slotId, studentId]
    );
    console.log('First insert succeeded, id=', r1.insertId);

    console.log('Attempting second insert (should fail if constraint present)...');
    try {
      const [r2] = await connection.query(
        'INSERT INTO Booking (Status, SlotID, StudentID) VALUES (?, ?, ?)',
        ['Confirmed', slotId, studentId]
      );
      console.log('Second insert unexpectedly succeeded, id=', r2.insertId);
    } catch (err) {
      if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
        console.log('Second insert failed as expected with duplicate-entry:', err.code || err.errno);
      } else {
        console.error('Second insert failed with unexpected error:', err);
      }
    }
  } catch (err) {
    console.error('Error running test script:', err);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

run();
