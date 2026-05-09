import "dotenv/config";

const url = process.env.DATABASE_URL;
const key = process.env.DATABASE_KEY;

if (!url || !key) {
  console.error("Missing DATABASE_URL or DATABASE_KEY");
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/vnd.pgrst.openapi+json",
  },
});

if (!res.ok) {
  console.error("OpenAPI fetch failed", res.status);
  const text = await res.text();
  console.error(text.slice(0, 1000));
  process.exit(1);
}

const spec = await res.json();
const schemas = spec.components?.schemas ?? {};
const entries = Object.entries(schemas).filter(
  ([name, schema]) =>
    schema?.properties &&
    !/_insert$|_update$|_delete$|_response$|_relationships$/.test(name),
);

if (entries.length === 0) {
  console.log("No tables found in OpenAPI schema");
  process.exit(0);
}

for (const [name, schema] of entries) {
  const cols = Object.keys(schema.properties || {});
  console.log(`${name}: ${cols.join(", ")}`);
}
