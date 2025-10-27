// This wrapper line fixes the "Cannot read properties of null" error
document.addEventListener('DOMContentLoaded', () => {

    // --- Get all the important elements from the HTML ---
    
    // Customer Detail Fields
    const invNumEntry = document.getElementById('inv-num');
    const invDateEntry = document.getElementById('inv-date');
    const custNameEntry = document.getElementById('cust-name');
    const custAddrEntry = document.getElementById('cust-addr');
    const custPhoneEntry = document.getElementById('cust-phone');
    const orderNumEntry = document.getElementById('order-num');
    const orderDateEntry = document.getElementById('order-date');
    const billTypeEntry = document.getElementById('bill-type');
    const custGstinEntry = document.getElementById('cust-gstin');
    const custStateEntry = document.getElementById('cust-state');
    
    // Item Entry Fields
    const itemDescEntry = document.getElementById('item-desc');
    const itemHsnEntry = document.getElementById('item-hsn');
    const itemQtyEntry = document.getElementById('item-qty');
    const itemCostEntry = document.getElementById('item-cost');
    const itemGstEntry = document.getElementById('item-gst');
    
    // Buttons
    const addItemBtn = document.getElementById('add-item-btn');
    const saveInvoiceBtn = document.getElementById('save-invoice-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    
    // Item Table
    // This line correctly finds the table body by its ID
    const itemTableBody = document.getElementById('item-table-body');
    
    // --- This array will store all the items added ---
    let currentItems = [];

    // --- Function to set today's date (like your original code) ---
    function setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        invDateEntry.value = today;
        orderDateEntry.value = today;
    }
    setTodayDate(); // Call it immediately

    // --- 1. "Add Item" Button Logic ---
    addItemBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form from submitting
        
        // Get values from item fields
        const desc = itemDescEntry.value;
        const hsn = itemHsnEntry.value;
        const qty = parseFloat(itemQtyEntry.value);
        const cost = parseFloat(itemCostEntry.value);
        const gst = parseFloat(itemGstEntry.value);

        // Validation (like your original code)
        if (!desc || !hsn) {
            alert("Error: Please enter a Description and HSN/SAC.");
            return;
        }
        if (isNaN(qty) || isNaN(cost) || isNaN(gst)) {
            alert("Error: Quantity, Cost, and GST must be numbers.");
            return;
        }

        // Calculation (like your original code)
        const baseCost = qty * cost;
        const totalCost = baseCost + (baseCost * (gst / 100));

        // Create an item object
        const item = {
            desc: desc,
            hsn: hsn,
            qty: qty.toFixed(2),
            rate: cost.toFixed(2),
            gst: gst.toFixed(2),
            total: totalCost.toFixed(2)
        };

        // Add item to our array
        currentItems.push(item);
        
        // Update the HTML table
        updateItemTable();
        
        // Clear the item entry fields
        itemDescEntry.value = '';
        itemHsnEntry.value = '';
        itemQtyEntry.value = '';
        itemCostEntry.value = '';
        itemGstEntry.value = '';
    });

    // --- Function to redraw the item table ---
    function updateItemTable() {
        // Clear the table body
        itemTableBody.innerHTML = '';
        
        // Loop through the currentItems array and add a row for each
        currentItems.forEach(item => {
            // This is the line that was failing before
            const row = itemTableBody.insertRow(); 
            row.innerHTML = `
                <td>${item.desc}</td>
                <td>${item.hsn}</td>
                <td>${item.qty}</td>
                <td>${item.rate}</td>
                <td>${item.gst}</td>
                <td>${item.total}</td>
            `;
        });
    }

    // --- 2. "Save Invoice" Button Logic ---
    saveInvoiceBtn.addEventListener('click', async () => {
        
        // Get all customer details
        const customerDetails = {
            inv_num: invNumEntry.value,
            inv_date: invDateEntry.value,
            cust_name: custNameEntry.value,
            cust_addr: custAddrEntry.value,
            cust_phone: custPhoneEntry.value,
            order_num: orderNumEntry.value,
            order_date: orderDateEntry.value,
            bill_type: billTypeEntry.value,
            cust_gstin: custGstinEntry.value,
            cust_state: custStateEntry.value
        };

        // Validation
        if (!customerDetails.inv_num || !customerDetails.cust_name) {
            alert("Error: Invoice Number and Customer Name are required.");
            return;
        }
        if (currentItems.length === 0) {
            alert("Error: Please add at least one item.");
            return;
        }

        // Create the final data object to send to the server
        const invoiceData = {
            customerDetails: customerDetails,
            items: currentItems
        };

        // Send the data to the Flask server
        try {
            saveInvoiceBtn.textContent = "Saving...";
            saveInvoiceBtn.disabled = true;

            const response = await fetch('/save_invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            });

            if (response.ok) {
                // The server is sending back the Excel file
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Invoice_${customerDetails.inv_num}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                
                // Clear the form
                clearAllFields();
                alert("Success: Invoice saved and downloaded!");

            } else {
                // Show an error
                const errorData = await response.json();
                alert(`Error saving invoice: ${errorData.error}`);
            }

        } catch (error) {
            alert(`Network error: ${error}`);
        } finally {
            saveInvoiceBtn.textContent = "Save Invoice";
            saveInvoiceBtn.disabled = false;
        }
    });
    
    // --- 3. "Clear All" Button Logic ---
    clearAllBtn.addEventListener('click', clearAllFields);

    function clearAllFields() {
        // Clear all input fields
        invNumEntry.value = '';
        custNameEntry.value = '';
        custAddrEntry.value = '';
        custPhoneEntry.value = '';
        orderNumEntry.value = '';
        billTypeEntry.value = '';
        custGstinEntry.value = '';
        custStateEntry.value = '';
        
        // Reset dates
        setTodayDate();
        
        // Clear the items array and update the table
        currentItems = [];
        updateItemTable();
    }
}); // This is the closing wrapper line