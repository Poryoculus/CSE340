'use strict'

// Global variables to track current state
let currentClassificationId = null;
let currentMinPrice = 0;
let currentMaxPrice = 999999;

// Get a list of items in inventory based on the classification_id 
let classificationList = document.querySelector("#classificationList")
classificationList.addEventListener("change", function () { 
  currentClassificationId = classificationList.value;
  console.log(`classification_id changed to: ${currentClassificationId}`); 
  
  if (!currentClassificationId) {
    console.log("No classification selected, clearing table");
    document.getElementById("inventoryDisplay").innerHTML = 
      '<tr><td>Select a classification to view inventory</td></tr>';
    return;
  }
  
  // Reset price filters when classification changes
  document.getElementById("minPrice").value = '';
  document.getElementById("maxPrice").value = '';
  currentMinPrice = 0;
  currentMaxPrice = 999999;
  
  loadInventoryData();
})

// Apply price filter
document.getElementById("applyFilter").addEventListener("click", function() {
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  
  currentMinPrice = minPrice ? parseInt(minPrice) : 0;
  currentMaxPrice = maxPrice ? parseInt(maxPrice) : 999999;
  
  if (currentMinPrice > currentMaxPrice) {
    alert("Minimum price cannot be greater than maximum price");
    return;
  }
  
  if (currentClassificationId) {
    loadInventoryData();
  } else {
    alert("Please select a classification first");
  }
});

// Clear price filter
document.getElementById("clearFilter").addEventListener("click", function() {
  document.getElementById("minPrice").value = '';
  document.getElementById("maxPrice").value = '';
  currentMinPrice = 0;
  currentMaxPrice = 999999;
  
  if (currentClassificationId) {
    loadInventoryData();
  }
});

// Function to load inventory data with current filters
function loadInventoryData() {
  if (!currentClassificationId) return;
  
  let url;
  if (currentMinPrice > 0 || currentMaxPrice < 999999) {
    // Use price filter
    url = `/inv/getInventoryByPrice/${currentClassificationId}?minPrice=${currentMinPrice}&maxPrice=${currentMaxPrice}`;
    console.log(`Loading filtered data: ${url}`);
  } else {
    // Use regular endpoint
    url = `/inv/getInventory/${currentClassificationId}`;
    console.log(`Loading regular data: ${url}`);
  }
  
  // Show loading message
  document.getElementById("inventoryDisplay").innerHTML = 
    '<tr><td>Loading inventory data...</td></tr>';
  
  fetch(url) 
  .then(function (response) { 
    if (response.ok) { 
      return response.json(); 
    } 
    throw Error("Network response was not OK"); 
  }) 
  .then(function (data) { 
    console.log("Data received:", data); 
    buildInventoryList(data); 
  }) 
  .catch(function (error) { 
    console.log('There was a problem: ', error.message);
    document.getElementById("inventoryDisplay").innerHTML = 
      '<tr><td>Error loading inventory: ' + error.message + '</td></tr>';
  });
}

// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
  let inventoryDisplay = document.getElementById("inventoryDisplay"); 
  
  if (!data || data.length === 0) {
    let message = "No vehicles found";
    if (currentMinPrice > 0 || currentMaxPrice < 999999) {
      message += ` in price range $${currentMinPrice} - $${currentMaxPrice}`;
    }
    message += " for this classification";
    
    inventoryDisplay.innerHTML = `<tr><td>${message}</td></tr>`;
    return;
  }
  
  // Set up the table labels 
  let dataTable = '<thead>'; 
  dataTable += '<tr><th>Vehicle Name</th><th>Price</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
  dataTable += '</thead>'; 
  
  // Set up the table body 
  dataTable += '<tbody>'; 
  
  // Iterate over all vehicles in the array and put each in a row 
  data.forEach(function (element) { 
    console.log(element.inv_id + ", " + element.inv_model + ", $" + element.inv_price); 
    dataTable += `<tr>
      <td>${element.inv_make} ${element.inv_model}</td>
      <td>$${new Intl.NumberFormat().format(element.inv_price)}</td>
      <td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>
      <td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>
    </tr>`; 
  }) 
  
  dataTable += '</tbody>'; 
  
  // Display the contents in the Inventory Management view 
  inventoryDisplay.innerHTML = dataTable; 
  
  // Show filter info
  if (currentMinPrice > 0 || currentMaxPrice < 999999) {
    const filterInfo = document.createElement('div');
    filterInfo.className = 'alert alert-info';
    filterInfo.innerHTML = `Showing ${data.length} vehicles filtered by price: $${currentMinPrice} - $${currentMaxPrice}`;
    inventoryDisplay.parentNode.insertBefore(filterInfo, inventoryDisplay);
  }
}