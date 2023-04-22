async function yelpRequestLocation(location) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?location=${location}`,
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

async function yelpRequestCoordinates(latitude, longitude) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}`,
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
  let filteredData = [];

  for (let i = 0; i < data.length; i++) {
    const filteredObj = {
      id: data[i].id,
      name: data[i].name,
      coordinates: data[i].coordinates,
      phone: data[i].phone,
    };
    filteredData.push(filteredObj);
  }

  return { businesses: filteredData };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.location) {
      const data = await yelpRequestLocation(req.query.location);
      res.status(200).json(data);
    } else if (
      parseFloat(req.query.longitude) &&
      parseFloat(req.query.latitude)
    ) {
      const data = await yelpRequestCoordinates(
        req.query.latitude,
        req.query.longitude
      );
      res.status(200).json(data);
    } else {
      res.status(400).json({ message: "Missing or invalid query parameter" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
