async function yelpRequest(location) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?location=${location}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  return data;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.location) {
      const data = await yelpRequest(req.query.location);
      res.status(200).json(data);
    } else {
      res.status(400).json({ message: "Missing name query parameter" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
