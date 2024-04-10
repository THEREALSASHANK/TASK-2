document.addEventListener('DOMContentLoaded', () => {
    const weatherForm = document.getElementById('weatherForm');
    const locationInput = document.getElementById('locationInput');
    const weatherInfo = document.getElementById('weatherInfo');
    const forecast = document.getElementById('forecast');
    const mapContainer = document.getElementById('map');

    let map; // Leaflet map object

    // Initialize Leaflet map
    function initMap() {
        map = L.map(mapContainer).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    }

    // Event listener for weather form submission
    weatherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const location = locationInput.value.trim();
        if (!location) return;

        try {
            // Fetch current weather data
            const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=YOUR_API_KEY`);
            if (!currentWeatherResponse.ok) {
                throw new Error('Failed to fetch current weather data');
            }
            const currentWeatherData = await currentWeatherResponse.json();

            // Display current weather info
            const weatherDescription = currentWeatherData.weather[0].description;
            const temperature = currentWeatherData.main.temp;
            const humidity = currentWeatherData.main.humidity;
            weatherInfo.innerHTML = `
                <h2>Current Weather</h2>
                <p><strong>Location:</strong> ${currentWeatherData.name}</p>
                <p><strong>Description:</strong> ${weatherDescription}</p>
                <p><strong>Temperature:</strong> ${temperature}°C</p>
                <p><strong>Humidity:</strong> ${humidity}%</p>
            `;

            // Fetch forecast data
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=YOUR_API_KEY`);
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            const forecastData = await forecastResponse.json();

            // Display forecast for upcoming days
            const forecastItems = forecastData.list.slice(0, 5); // Display forecast for next 5 entries
            forecast.innerHTML = `
                <h2>5-Day Forecast</h2>
                <ul>
                    ${forecastItems.map(item => `
                        <li>${item.dt_txt}: ${item.main.temp}°C, ${item.weather[0].description}</li>
                    `).join('')}
                </ul>
            `;

            // Update map location and popup with weather info
            const { lat, lon } = currentWeatherData.coord;
            if (!map) initMap(); // Initialize map if not already done
            map.setView([lat, lon], 10);
            L.marker([lat, lon]).addTo(map).bindPopup(`${currentWeatherData.name}: ${temperature}°C, ${weatherDescription}`).openPopup();
        } catch (error) {
            console.error('Error fetching weather data:', error);
            weatherInfo.innerHTML = '<p>Failed to fetch weather data. Please try again.</p>';
            forecast.innerHTML = ''; // Clear forecast
            if (map) map.remove(); // Remove map if initialized
        }
    });
});
