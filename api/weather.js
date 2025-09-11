export default async function handler(request, response) {
  const { endpoint, city } = request.query;
  const apiKey = process.env.VITE_OPENWEATHER_API_KEY; 
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch weather data' });
  }
}