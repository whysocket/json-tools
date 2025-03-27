# JSON to Table / JWT Decoder

This is a completely open-source project providing two simple web-based tools:

* **JSON to Table:** Converts JSON data into an easily readable, hierarchical table format.
* **JWT Decoder:** Decodes JSON Web Tokens (JWTs) to display their header, payload, and signature, along with information about the token's validity, issuance, and expiration.

## Why?

As a backend developer, I frequently found myself needing quick and efficient ways to inspect JSON data and decode JWTs, especially when working with backend APIs and their Swagger/Scalar documentation. Existing tools were often cumbersome or lacked the necessary features for rapid debugging and analysis. This project was born out of that necessity, providing a streamlined and user-friendly solution for these common tasks.

## Features

* **JSON to Table:**
    * Presents JSON data in a clear, structured table.
    * Handles nested JSON objects and arrays.
* **JWT Decoder:**
    * Decodes JWTs and displays their components.
    * Shows the token's algorithm, claims, and signature.
    * Provides information about token validity and timestamps.

## Usage

1.  Open the web application: [https://whysocket.dev](https://whysocket.dev)
2.  Choose either the "JSON to Table" or "JWT Decoder" tab.
3.  Paste your JSON data or JWT into the input field.
4.  The results will be displayed in the corresponding output area.