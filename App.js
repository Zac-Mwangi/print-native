import React, { useState } from 'react';
import { View, Button } from 'react-native';
import Dialog from 'react-native-dialog';
import BluetoothEscposPrinter from 'react-native-bluetooth-escpos-printer';

const App = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [devices, setDevices] = useState([]);

  // Function to handle the dialog box visibility
  const showDialog = () => {
    setDialogVisible(true);
    // Scan for available devices
    BluetoothEscposPrinter.scanDevices()
      .then((foundDevices) => {
        setDevices(foundDevices);
      })
      .catch((error) => {
        console.error('Failed to scan devices', error);
      });
  };

  // Function to handle printer selection
  const handlePrinterSelection = (printer) => {
    setSelectedPrinter(printer);
    setDialogVisible(false);
  };

  // Function to print the supermarket receipt
  const printSupermarketReceipt = () => {
    if (!selectedPrinter) {
      console.error('No printer selected');
      return;
    }

    // Receipt header
    const headerText = 'Supermarket Receipt';
    const receiptNumber = 'Receipt #: 12345';
    const date = new Date().toLocaleString();

    // Product details
    const products = [
      { name: 'Product 1', quantity: 2, price: 10 },
      { name: 'Product 2', quantity: 1, price: 5 },
      { name: 'Product 3', quantity: 3, price: 8 },
    ];

    // Receipt footer
    const totalItems = products.reduce((total, product) => total + product.quantity, 0);
    const totalPrice = products.reduce((total, product) => total + product.price * product.quantity, 0);

    // Connect to the Bluetooth printer
    BluetoothEscposPrinter.connectPrinter(selectedPrinter.address)
      .then(() => {
        // Print receipt header
        BluetoothEscposPrinter.printText(headerText, { fontSize: 24, align: 'center', bold: true });
        BluetoothEscposPrinter.printText(receiptNumber, { align: 'center' });
        BluetoothEscposPrinter.printText(`Date: ${date}`, { align: 'center' });
        BluetoothEscposPrinter.printText('--------------------------------');

        // Print product details
        products.forEach((product) => {
          const { name, quantity, price } = product;
          const lineTotal = quantity * price;
          BluetoothEscposPrinter.printText(`${name} x ${quantity}  ${lineTotal.toFixed(2)}`);
        });

        BluetoothEscposPrinter.printText('--------------------------------');

        // Print receipt footer
        BluetoothEscposPrinter.printText(`Total Items: ${totalItems}`);
        BluetoothEscposPrinter.printText(`Total Price: ${totalPrice.toFixed(2)}`);
        BluetoothEscposPrinter.printText('--------------------------------');

        // Cut the receipt
        BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        BluetoothEscposPrinter.printerCut();

        // Disconnect from the printer
        BluetoothEscposPrinter.disconnectPrinter();
      })
      .catch((error) => {
        console.error('Failed to print receipt', error);
      });
  };

  return (
    <View>
      <Button title="Choose Printer" onPress={showDialog} />

      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Select a Printer</Dialog.Title>
        {devices.map((printer) => (
          <Dialog.Button
            key={printer.address}
            label={printer.name}
            onPress={() => handlePrinterSelection(printer)}
          />
        ))}
        <Dialog.Button label="Cancel" onPress={() => setDialogVisible(false)} />
      </Dialog.Container>

      <Button title="Print Receipt" onPress={printSupermarketReceipt} disabled={!selectedPrinter} />
    </View>
  );
};

export default App;
