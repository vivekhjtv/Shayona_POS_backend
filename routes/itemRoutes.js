const express = require('express');
const net = require('net');
const router = express.Router();
const db = require('../config/database');
require('dotenv').config();

const IP = process.env.PRINTER_IP;
const PRINTER_PORT = 9100; // Default port for network printers

// Function to send data to the printer
const sendToPrinter = (data) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(PRINTER_PORT, IP, () => {
      console.log('Connected to printer');

      // Write receipt data first
      client.write(data, 'binary', (err) => {
        if (err) {
          return reject('Error writing to printer: ' + err);
        }
        console.log('Data sent to printer');

        // Introduce a delay to ensure the printer finishes printing the data
        setTimeout(() => {
          // Add 20 lines of space (adjust as needed)
          const spaceLines = Buffer.from([0x1B, 0x4A, 0x14]); // ESC/POS command for line feed (20 lines)
          client.write(spaceLines, 'binary', (spaceErr) => {
            if (spaceErr) {
              return reject('Error sending space command: ' + spaceErr);
            }

            // Send cut command
            const cutCommand = Buffer.from([0x1D, 0x56, 0x00]); // ESC/POS command for full cut
            client.write(cutCommand, 'binary', (cutErr) => {
              if (cutErr) {
                return reject('Error sending cut command: ' + cutErr);
              }
              client.end(); // Close the connection after sending data
              console.log('Paper cut command sent');
              resolve();
            });
          });
        }, 1000); // Delay to ensure the receipt data is printed (1000ms)
      });
    });

    client.on('error', (err) => {
      reject('Printer connection error: ' + err);
    });

    client.on('close', () => {
      console.log('Connection to printer closed');
    });
  });
};

// Middleware
router.use('/api/items/', (req, res, next) => {
  next();
});

// /api/items
router
  .route('/')
  .get(async (req, res) => {
    try {
      const items = await db.getAllItems();
      res.status(200).json(items);
    } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post(async (req, res) => {
    try {
      console.log('Items :- ', req.body);
      const newItem = await db.addNewItem(req.body);

      // Print receipt after adding new item
      const { items, customerName, date, time } = req.body;

      // Define receipt content with styling
      const ESC = '\x1B'; // ESC byte in hex notation
      const GS = '\x1D'; // GS byte in hex notation for some advanced commands
      const newLine = '\n';
      const boldOn = ESC + 'E' + '\x01'; // ESC/POS command for bold on
      const boldOff = ESC + 'E' + '\x00'; // ESC/POS command for bold off
      const centerAlign = ESC + 'a' + '\x01'; // ESC/POS command for center alignment
      const leftAlign = ESC + 'a' + '\x00'; // ESC/POS command for left alignment
      const doubleSizeOn = GS + '!' + '\x11'; // ESC/POS command for double height and width text
      const normalSize = GS + '!' + '\x00'; // ESC/POS command for normal text size

      let receiptData = `${centerAlign}${doubleSizeOn}${boldOn}BAPS Shayona${boldOff}${normalSize}${newLine}`;
      receiptData += `${leftAlign}-----------------------------------------${newLine}`;
      receiptData += `${boldOn}Customer:${boldOff} ${customerName}${newLine}`;
      receiptData += `${boldOn}Date:${boldOff} ${date}${newLine}`;
      receiptData += `${boldOn}Time:${boldOff} ${time}${newLine}`;
      receiptData += `${boldOn}Items:${boldOff}${newLine}`;

      // Make all items bold and in larger font size
      items.forEach((item) => {
        receiptData += `${doubleSizeOn}${boldOn}${item.name}: ${item.quantity}${boldOff}${normalSize}${newLine}`;
      });

      receiptData += '-----------------------------------------' + newLine;
      receiptData += `${centerAlign}${boldOn}Thank you for your purchase!${boldOff}${newLine}`;
      receiptData += newLine.repeat(5); // Add 5 new lines (adjust as needed)

      // Convert receipt data to buffer and send to printer
      const receiptBuffer = Buffer.from(receiptData, 'utf8');

      try {
        await sendToPrinter(receiptBuffer);
        res.status(201).json(newItem);
      } catch (printerError) {
        console.error(printerError);
        res.status(500).json({ error: 'Failed to print receipt' });
      }
    } catch (err) {
      console.error('Error adding new items:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });

router.route('/:itemId').delete(async (req, res) => {
  try {
    const deletedItem = await db.deleteItem(req.params.itemId);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
