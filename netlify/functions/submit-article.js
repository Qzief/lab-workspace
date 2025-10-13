const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    console.log("Received data:", data);

    const { nama, title, date, category, tags, excerpt, content } = data;
    const token = process.env.GITHUB_TOKEN;
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;

    console.log("GITHUB_TOKEN exists?", !!token);
    console.log("NETLIFY_BUILD_HOOK exists?", !!buildHookUrl);

    if (!token) {
      throw new Error("Missing GitHub token");
    }
    if (!buildHookUrl) {
      throw new Error("Missing Netlify build hook URL");
    }

    // Parse tags
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    const tagsFormatted =
      tagsArray.length > 0
        ? `[${tagsArray.map((tag) => `"${tag}"`).join(", ")}]`
        : "[]";

    // Generate frontmatter
    const frontmatter = `---
title: ${title}
date: ${date}
category: ${category}
tags: ${tagsFormatted}
author: ${nama}
excerpt: ${excerpt}
---

`;

    // Combine frontmatter and content
    const fullContent = frontmatter + content;

    // Generate filename
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `${date}-${slug}.md`;

    const repo = "Qzief/lab-workspace";
    const path = `posts/${filename}`;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    // Encode content
    const contentBase64 = Buffer.from(fullContent).toString("base64");

    // Commit to GitHub
    const commitData = {
      message: `Add new article: ${title}`,
      content: contentBase64,
    };

    console.log("Sending to GitHub:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commitData),
    });

    const result = await response.json();
    console.log("GitHub response:", result);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    // Trigger Netlify build hook
    console.log("Triggering build...");
    await fetch(buildHookUrl, { method: "POST" });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Article submitted successfully" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
