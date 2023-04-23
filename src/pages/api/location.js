async function yelpRequestLocation(
  location,
  page = 1,
  limit = 10,
  categories = []
) {
  const params = new URLSearchParams({
    location: location,
    offset: (page - 1) * limit,
    limit: limit,
    categories: categories.join(","),
    radius: 10000,
  });
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    }
  );
  const data = await response.json();

  if (response.status !== 200) return data;
  return filterKeys(data);
}

async function yelpRequestCoordinates(
  latitude = 0,
  longitude = 0,
  page = 1,
  limit = 10,
  categories = []
) {
  const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    offset: (page - 1) * limit,
    limit: limit,
    categories: categories.join(","),
    radius: 10000,
  });
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    }
  );
  const data = await response.json();

  if (response.status !== 200) return data;
  return filterKeys(data);
}

function filterKeys(obj) {
  const data = obj.businesses;
  const filteredData = [];

  for (let i = 0; i < data.length; i++) {
    const filteredObj = {
      id: data[i].id,
      name: data[i].name,
      coordinates: data[i].coordinates,
      location:
        data[i].location.display_address[0] +
        ", " +
        data[i].location.display_address[1],
      url: data[i].url,
    };
    filteredData.push(filteredObj);
  }

  return { businesses: filteredData };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.location) {
      const data = await yelpRequestLocation(
        req.query.location,
        req.query.page,
        req.query.limit,
        req.query.categories
      );
      res.status(200).json(data);
    } else if (
      parseFloat(req.query.longitude) !== null &&
      parseFloat(req.query.latitude) !== null
    ) {
      const data = await yelpRequestCoordinates(
        req.query.latitude,
        req.query.longitude,
        req.query.page,
        req.query.limit,
        req.query.categories
      );
      res.status(200).json(data);
    } else {
      res.status(400).json({ message: "Missing or invalid query parameter" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
