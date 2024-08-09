const usb = require('usb');
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Replace these with your actual Vendor ID and Product ID
const VENDOR_ID = 0x1504; // e.g., 0x1234
const PRODUCT_ID = 0x003d; // e.g., 0x5678

router.use('/api/items/', (req, res, next) => {
  next();
});

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
      // Add new item to the database
      const newItem = await db.addNewItem(req.body);

      // Prepare the receipt data with ESC/POS commands for formatting
      const { items, customerName, date, time } = req.body;

      // ESC/POS commands
      const ESC = Buffer.from([0x1b]);
      const CENTER_ALIGN = Buffer.from([0x1b, 0x61, 0x01]); // Center alignment
      const LEFT_ALIGN = Buffer.from([0x1b, 0x61, 0x00]); // Left alignment
      const BOLD_ON = Buffer.from([0x1b, 0x45, 0x01]); // Enable bold
      const BOLD_OFF = Buffer.from([0x1b, 0x45, 0x00]); // Disable bold
      const LARGE_TEXT = Buffer.from([0x1d, 0x21, 0x11]); // Set larger text size (varies by printer)
      const NORMAL_TEXT = Buffer.from([0x1d, 0x21, 0x00]); // Reset to normal text size
      const CUT_PAPER = Buffer.from([0x1d, 0x56, 0x00]); // Cut command

      // Create receipt data with ESC/POS commands
      let receiptData = Buffer.concat([
        ESC,
        CENTER_ALIGN, // Center align
        LARGE_TEXT, // Larger font size
        Buffer.from(`"BAPS Shayona"\n`),
        NORMAL_TEXT, // Reset to normal font size
        LEFT_ALIGN, // Left align
        Buffer.from(`Customer: ${customerName}\n`),
        Buffer.from(`Date: ${date}\n`),
        Buffer.from(`Time: ${time}\n`),
        Buffer.from(`Items:\n`),
        BOLD_ON, // Start bold text
        ...items.map((item) => Buffer.from(`${item.name}: ${item.quantity}\n`)),
        BOLD_OFF, // End bold text
        Buffer.from('----------------------\n'),
        Buffer.from('Thank you for your purchase!\n'),
        Buffer.from('\n\n\n\n\n'), // Add margins and spacing
      ]);

      console.log(receiptData.toString());

      // Find the USB device
      const device = usb.findByIds(VENDOR_ID, PRODUCT_ID);

      if (!device) {
        return res.status(500).json({ error: 'Printer not found' });
      }

      device.open();
      const iface = device.interfaces[0];
      iface.claim();

      // Find the endpoint (usually endpoint 0x01 for output)
      const endpoint = iface.endpoints.find((ep) => ep.direction === 'out');
      if (!endpoint) {
        return res.status(500).json({ error: 'Endpoint not found' });
      }

      // Send the data to the printer in chunks
      const CHUNK_SIZE = 4096; // Adjust chunk size as needed

      function sendChunk(offset) {
        if (offset >= receiptData.length) {
          // Send the cut command after all data is sent
          setTimeout(() => {
            endpoint.transfer(CUT_PAPER, (error) => {
              if (error) {
                console.error('Failed to send cut command:', error);
                return res.status(500).json({ error: 'Failed to cut paper' });
              }

              console.log('Receipt printed and cut successfully');
              res.status(201).json({
                message: 'Item added and receipt printed successfully',
              });
            });
          }, 1000); // Adjust delay as needed
          return;
        }

        const chunk = receiptData.slice(offset, offset + CHUNK_SIZE);
        endpoint.transfer(chunk, (error) => {
          if (error) {
            console.error('Failed to send data chunk:', error);
            return res.status(500).json({ error: 'Failed to print data' });
          }

          // Send next chunk
          sendChunk(offset + CHUNK_SIZE);
        });
      }

      // Start sending chunks
      sendChunk(0);
    } catch (err) {
      console.error('Error adding new items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
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
