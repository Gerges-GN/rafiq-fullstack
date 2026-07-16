const GROQ_API_URL = process.env.GROQ_API_URL;
const MODEL = process.env.MODEL;

const getPlaceRecommendations = async (description, places) => {
  const placesForPrompt = places.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    city: p.city,
    category: p.category,
    description: p.description,
  }));

  const systemPrompt = `You are a travel recommendation engine for an Egypt tourism app.
You will be given a tourist's description of what they want, and a list of candidate places (with id, name, city, category, description).
Pick the places from the list that best match what the tourist wants — do not invent places that are not in the list.
Respond ONLY with valid JSON, no markdown, no preamble, in this exact shape:
{"recommendations": [{"id": "<place id from the list>", "reason": "<one short sentence on why it fits>"}]}
Return at most 6 recommendations, ordered from best to weakest match. If nothing matches well, return an empty array.`;

  const userPrompt = `Tourist's request: "${description}"

Candidate places:
${JSON.stringify(placesForPrompt, null, 2)}`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq API request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq API returned no content");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error("Failed to parse Groq API response as JSON");
  }

  return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
};

module.exports = { getPlaceRecommendations };