const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "DELETE") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { filename } = JSON.parse(event.body);
    const token = process.env.GITHUB_TOKEN;
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;

    if (!token) {
      throw new Error("Missing GitHub token");
    }
    if (!buildHookUrl) {
      throw new Error("Missing Netlify build hook URL");
    }

    const repo = "Qzief/lab-workspace";
    const path = `posts/${filename}`;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    // First, get the file to obtain its SHA
    const getResponse = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!getResponse.ok) {
      throw new Error(`File not found: ${filename}`);
    }

    const fileData = await getResponse.json();
    const sha = fileData.sha;

    // Delete the file
    const deleteResponse = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete article: ${filename}`,
        sha: sha,
      }),
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(`GitHub API error: ${errorData.message}`);
    }

    // Update index.json by removing the filename
    const indexUrl = `https://api.github.com/repos/${repo}/contents/posts/index.json`;
    const indexGetResponse = await fetch(indexUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (indexGetResponse.ok) {
      const indexData = await indexGetResponse.json();
      const indexContent = JSON.parse(
        Buffer.from(indexData.content, "base64").toString()
      );
      const updatedIndex = indexContent.filter((file) => file !== filename);
      const updatedIndexContent = JSON.stringify(updatedIndex, null, 2);
      const updatedIndexBase64 =
        Buffer.from(updatedIndexContent).toString("base64");

      await fetch(indexUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update index.json after deleting ${filename}`,
          content: updatedIndexBase64,
          sha: indexData.sha,
        }),
      });
    }

    // Trigger Netlify build hook
    await fetch(buildHookUrl, { method: "POST" });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Article deleted successfully" }),
    };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
