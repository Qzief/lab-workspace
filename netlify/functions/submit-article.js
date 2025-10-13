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

    const { nama, title, date, category, tags, excerpt, content } = data;

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

    // Generate filename: slugify title + date
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `${date}-${slug}.md`;

    // GitHub API details
    const repo = "Qzief/lab-workspace";
    const path = `posts/${filename}`;
    const token = process.env.GITHUB_TOKEN; // Set in Netlify env vars
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    // Check if file exists
    let sha = null;
    try {
      const checkResponse = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (checkResponse.ok) {
        const fileData = await checkResponse.json();
        sha = fileData.sha;
      }
    } catch (error) {
      // File doesn't exist, sha remains null
    }

    // Encode content to base64
    const contentBase64 = Buffer.from(fullContent).toString("base64");

    // Prepare commit data
    const commitData = {
      message: `Add new article: ${title}`,
      content: contentBase64,
    };
    if (sha) {
      commitData.sha = sha;
    }

    // Push to GitHub
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commitData),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    // Trigger Netlify build hook
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK; // Set in Netlify env vars
    await fetch(buildHookUrl, {
      method: "POST",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Article submitted successfully" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
