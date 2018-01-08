// TODO: add your JavaScript here!
function filter(event){
  event.preventDefault();
  const req = new XMLHttpRequest();

  const location = document.getElementsByName('location')[0].value;
  const cuisine = document.getElementsByName('cuisine')[0].value;
  const url = 'http://localhost:3000/api/places?location='+location+'&cuisine='+cuisine;

  req.open('GET', url, true);

  req.addEventListener('load', function(){
    if (req.status >= 200 && req.status < 400){
      let data = JSON.parse(req.responseText);
      let restaurantList = document.getElementById('places-list');
      restaurantList.innerHTML = '';

      data.forEach(function(restaurant){

        const tr = document.createElement('tr');
        const name = tr.appendChild(document.createElement('td'));
        const cuisine = tr.appendChild(document.createElement('td'));
        const location = tr.appendChild(document.createElement('td'));


        name.textContent = restaurant.name;
        location.textContent = restaurant.location;
        cuisine.textContent = restaurant.cuisine;

        restaurantList.appendChild(tr);

      });
    }
    document.getElementById('error').textContent = "";
    document.getElementById('name').value = "";
    document.getElementsByName('location')[1].value = "";
    document.getElementsByName('cuisine')[1].value = "";
  });
  req.send();
}

function add(event){
  event.preventDefault();
  const req = new XMLHttpRequest();

  const name = document.getElementById('name').value;
  const location = document.getElementsByName('location')[1].value;
  const cuisine = document.getElementsByName('cuisine')[1].value;

  req.open('POST', 'http://localhost:3000/api/places/create', true);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  req.send('name=' + name + '&cuisine=' + cuisine + '&location=' + location);

  let error = document.querySelector('#error');
  if (error === null){
    error = document.createElement('p');
    error.id = "error";
    document.getElementById('create-div').appendChild(error);
  }


  req.addEventListener('load', function(){

    document.getElementsByName('location')[0].value = "";
    document.getElementsByName('cuisine')[0].value = "";

    if (req.status >= 200 && req.status < 400){
      filter(event);
      error.textContent = "";

      const restaurantList = document.getElementById('places-list');

      const tr = document.createElement('tr');
      const nameTemp = document.createElement('td')
      const locationTemp = document.createElement('td');
      const cuisineTemp = document.createElement('td');

      nameTemp.textContent = name;
      locationTemp.textContent = location;
      cuisineTemp.textContent = cuisine;

      tr.appendChild(nameTemp);
      tr.appendChild(cuisineTemp);
      tr.appendChild(locationTemp);

      restaurantList.appendChild(tr);

      document.getElementById('name').value = "";
      document.getElementsByName('location')[1].value = "";
      document.getElementsByName('cuisine')[1].value = "";

    } else if (req.status == 500){
      error.textContent = "Please fill all the fields!";
    } else if (req.status == 501){
      error.textContent = "This restaurant is already added to the list!";
    }
  });
}

function main(){

  window.onload = filter;

  const filterBtn = document.getElementById('filterBtn');
  const addBtn = document.getElementById('addBtn');

  filterBtn.addEventListener('click', filter);
  addBtn.addEventListener('click', add);
}

document.addEventListener('DOMContentLoaded', main);
