// Weather App Class
class WeatherApp {
    constructor() {
        this.API_KEY = '524b5ab8470cd15d77842ee2764a929f'; // Replace with actual OpenWeatherMap API key
        this.currentCity = '';
        this.init();
    }

    // Initialize the app
    init() {
        this.bindEvents();
        this.requestLocation();
    }

    // Bind event listeners
    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        const refreshBtn = document.getElementById('refreshBtn');

        searchBtn.addEventListener('click', () => this.searchWeather());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        refreshBtn.addEventListener('click', () => this.refreshWeather());
    }

    // Request user's current location with auto-fallback
    requestLocation() {
        // Check if geolocation is available and already permitted
        if (navigator.geolocation && navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted') {
                    // Permission already granted, get location
                    navigator.geolocation.getCurrentPosition(
                        (position) => this.getWeatherByCoords(position.coords.latitude, position.coords.longitude),
                        () => this.getWeatherByCity('Kolkata') // Fallback to user's location
                    );
                } else {
                    // Permission not granted, use default location
                    this.getWeatherByCity('Kolkata');
                }
            }).catch(() => {
                // Fallback if permissions API not supported
                this.getWeatherByCity('Kolkata');
            });
        } else {
            // Geolocation not supported, use default location
            this.getWeatherByCity('Kolkata');
        }
    }

    // Search weather by city name
    async searchWeather() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput.value.trim();

        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        await this.getWeatherByCity(city);
    }

    // Get weather by city name
    async getWeatherByCity(city) {
        this.showLoading();
        this.currentCity = city;

        try {
            // For demo purposes, we'll use mock data since API key is placeholder
            if (this.API_KEY === 'YOUR_API_KEY_HERE') {
                await this.loadMockData(city);
                return;
            }

            // Current weather API call
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.API_KEY}&units=metric`
            );

            if (!currentResponse.ok) {
                throw new Error('City not found');
            }

            const currentData = await currentResponse.json();

            // 5-day forecast API call
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.API_KEY}&units=metric`
            );

            const forecastData = await forecastResponse.json();

            this.displayWeather(currentData, forecastData);
            this.hideLoading();

        } catch (error) {
            this.showError('Unable to fetch weather data. Please check the city name and try again.');
            this.hideLoading();
        }
    }

    // Get weather by coordinates
    async getWeatherByCoords(lat, lon) {
        this.showLoading();

        try {
            // For demo purposes, use mock data
            if (this.API_KEY === 'YOUR_API_KEY_HERE') {
                await this.loadMockData('Kolkata');
                return;
            }

            // Current weather API call
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );

            const currentData = await currentResponse.json();

            // 5-day forecast API call
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );

            const forecastData = await forecastResponse.json();

            this.currentCity = currentData.name;
            this.displayWeather(currentData, forecastData);
            this.hideLoading();

        } catch (error) {
            this.showError('Unable to fetch weather data for your location.');
            this.hideLoading();
        }
    }

    // Load mock data for demonstration
    async loadMockData(city) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockCurrentData = {
            name: city,
            main: {
                temp: 22,
                feels_like: 25,
                humidity: 65
            },
            weather: [{
                main: 'Clear',
                description: 'clear sky',
                icon: '01d'
            }],
            wind: {
                speed: 3.5
            },
            visibility: 10000
        };

        const mockForecastData = {
            list: [
                {
                    dt: Date.now() / 1000 + 86400,
                    main: { temp_max: 25, temp_min: 18 },
                    weather: [{ main: 'Clouds', icon: '02d' }]
                },
                {
                    dt: Date.now() / 1000 + 172800,
                    main: { temp_max: 28, temp_min: 20 },
                    weather: [{ main: 'Rain', icon: '10d' }]
                },
                {
                    dt: Date.now() / 1000 + 259200,
                    main: { temp_max: 23, temp_min: 16 },
                    weather: [{ main: 'Clear', icon: '01d' }]
                },
                {
                    dt: Date.now() / 1000 + 345600,
                    main: { temp_max: 26, temp_min: 19 },
                    weather: [{ main: 'Clouds', icon: '03d' }]
                },
                {
                    dt: Date.now() / 1000 + 432000,
                    main: { temp_max: 24, temp_min: 17 },
                    weather: [{ main: 'Clear', icon: '01d' }]
                }
            ]
        };

        this.displayWeather(mockCurrentData, mockForecastData);
        this.hideLoading();
    }

    // Display weather data
    displayWeather(currentData, forecastData) {
        // Update current weather
        document.getElementById('currentTemp').textContent = `${Math.round(currentData.main.temp)}°C`;
        document.getElementById('currentCondition').textContent = currentData.weather[0].description;
        document.getElementById('currentLocation').querySelector('span').textContent = currentData.name;

        // Update weather icon
        const iconElement = document.getElementById('currentIcon');
        iconElement.innerHTML = this.getWeatherIcon(currentData.weather[0].main);

        // Update details
        document.getElementById('feelsLike').textContent = `${Math.round(currentData.main.feels_like)}°C`;
        document.getElementById('humidity').textContent = `${currentData.main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`;
        document.getElementById('visibility').textContent = `${Math.round(currentData.visibility / 1000)} km`;

        // Update forecast
        this.displayForecast(forecastData.list);

        // Show weather content
        document.getElementById('weatherContent').classList.add('active');
    }

    // Display 5-day forecast
    displayForecast(forecastList) {
        const container = document.getElementById('forecastContainer');
        container.innerHTML = '';

        // Get daily forecasts (one per day)
        const dailyForecasts = [];
        const processedDates = new Set();

        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!processedDates.has(date) && dailyForecasts.length < 5) {
                dailyForecasts.push(item);
                processedDates.add(date);
            }
        });

        dailyForecasts.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });

            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card glass';
            forecastCard.innerHTML = `
                        <div class="forecast-day">${dayName}</div>
                        <div class="forecast-icon">${this.getWeatherIcon(item.weather[0].main)}</div>
                        <div class="forecast-temp">${Math.round(item.main.temp_max)}°</div>
                        <div class="forecast-temp-low">${Math.round(item.main.temp_min)}°</div>
                    `;

            container.appendChild(forecastCard);
        });
    }

    // Get weather icon based on condition
    getWeatherIcon(condition) {
        const icons = {
            'Clear': '<i class="fas fa-sun" style="color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.6);"></i>',
            'Clouds': '<i class="fas fa-cloud" style="color: #e2e8f0; text-shadow: 0 0 15px rgba(226, 232, 240, 0.4);"></i>',
            'Rain': '<i class="fas fa-cloud-rain" style="color: #60a5fa; text-shadow: 0 0 15px rgba(96, 165, 250, 0.6);"></i>',
            'Drizzle': '<i class="fas fa-cloud-rain" style="color: #60a5fa;"></i>',
            'Thunderstorm': '<i class="fas fa-bolt" style="color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);"></i>',
            'Snow': '<i class="fas fa-snowflake" style="color: #e2e8f0; text-shadow: 0 0 15px rgba(226, 232, 240, 0.6);"></i>',
            'Mist': '<i class="fas fa-smog" style="color: #9ca3af;"></i>',
            'Fog': '<i class="fas fa-smog" style="color: #9ca3af;"></i>'
        };
        return icons[condition] || '<i class="fas fa-sun" style="color: #fbbf24;"></i>';
    }


    // Show loading state with enhanced animation
    showLoading() {
        const loadingEl = document.getElementById('loading');
        loadingEl.classList.add('active');
        document.getElementById('error').classList.remove('active');
        document.getElementById('weatherContent').classList.remove('active');

        // Add extra loading animation
        setTimeout(() => {
            loadingEl.style.transform = 'scale(1.05)';
            setTimeout(() => {
                loadingEl.style.transform = 'scale(1)';
            }, 200);
        }, 100);
    }

    // Hide loading state
    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }

    // Show error state
    showError(message) {
        document.getElementById('error').classList.add('active');
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('weatherContent').classList.remove('active');
    }

    // Refresh current weather with enhanced animation
    refreshWeather() {
        const refreshIcon = document.querySelector('.refresh-btn i');

        // Only animate the icon, not the button container
        refreshIcon.style.animation = 'advancedSpin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        setTimeout(() => {
            refreshIcon.style.animation = '';
        }, 1500);

        if (this.currentCity) {
            this.getWeatherByCity(this.currentCity);
        } else {
            this.requestLocation();
        }
    }
}

// Initialize the weather app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();

    // Add staggered animation to forecast cards when they appear
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = `fadeInUp 0.6s ease-out both`;
                }, index * 100);
            }
        });
    });

    // Observe forecast cards for animation
    setTimeout(() => {
        document.querySelectorAll('.forecast-card').forEach(card => {
            observer.observe(card);
        });
    }, 1000);
});

// Add enhanced interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Enhanced ripple effect for buttons
    const buttons = document.querySelectorAll('.search-btn, .refresh-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: enhancedRipple 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                        pointer-events: none;
                        z-index: 10;
                    `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 800);
        });
    });

    // Add particle effect to weather cards
    document.addEventListener('click', (e) => {
        if (e.target.closest('.glass')) {
            createParticles(e.clientX, e.clientY);
        }
    });

    // Parallax effect for background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('body::before');
        if (parallax) {
            document.body.style.backgroundPosition = `center ${scrolled * 0.5}px`;
        }
    });

    // Add ripple and particle animations CSS
    const style = document.createElement('style');
    style.textContent = `
                @keyframes enhancedRipple {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                @keyframes particleFloat {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-100px) scale(0);
                    }
                }

                .particle {
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, #60a5fa, #a78bfa);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    animation: particleFloat 2s ease-out forwards;
                }
            `;
    document.head.appendChild(style);
});

// Create floating particles effect
function createParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = (x + Math.random() * 20 - 10) + 'px';
        particle.style.top = (y + Math.random() * 20 - 10) + 'px';
        particle.style.animationDelay = (Math.random() * 0.3) + 's';

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
}

// Disable right-click context menu
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
});

// Disable common keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
    }

    // Disable F12 (Developer Tools)
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
    }
});

// Disable text selection (optional)
document.addEventListener('selectstart', function (e) {
    e.preventDefault();
    return false;
});

// Disable drag and drop (optional)
document.addEventListener('dragstart', function (e) {
    e.preventDefault();
    return false;
});