exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Admin credentials not configured" }),
      };
    }

    if (username === adminUsername && password === adminPassword) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "Login successful" }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
