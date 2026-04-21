# Imaginer RESTful API Documentation

Welcome to the Imaginer RESTful API. This API allows developers to integrate our AI image generation capabilities directly into their applications.

**Base URL:**
```http
https://imaginer.mirava.studio
```
All endpoints below are relative to this Base URL.

## Authentication

All API endpoints require authentication using a Bearer token. You can manage your API keys from the developer dashboard.

**Header Format:**
```http
Authorization: Bearer sk_imaginer_...
```

---

## Endpoints

### 1. Get Available Models
Retrieve a list of all currently available models and their supported configurations (dimensions, qualities, ratios, styles).

**Endpoint:** `GET /api/public/v1/models`

**Response (200 OK):**
```json
{
  "models": [
    {
      "id": "nano-banana-2",
      "display_name": "Nano Banana 2",
      "api_version": "v2",
      "supports_reference_images": true,
      "max_reference_images": 6,
      "qualities": ["1K", "2K", "4K"],
      "ratios": ["1:1", "16:9", "9:16"],
      "styles": [
        { "slug": "anime", "name": "Anime Style" }
      ],
      "dimensions": [
        { "label": "Square", "width": 1024, "height": 1024 }
      ],
      "enabled": true
    }
  ]
}
```

---

### 2. Upload Reference Image
Upload an image to be used as a reference (img2img, ControlNet, etc.) in a generation request.

**Endpoint:** `POST /api/public/v1/upload`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `image` | `File` | Yes | The physical image file to upload. Supported formats: PNG, JPEG, WebP. Maximum file size is strictly 10MB. |

**Response (200 OK):**
```json
{
  "image_id": "uuid-string-here",
  "message": "Image uploaded successfully. Use this image_id in the ref_image_ids array of the generate endpoint."
}
```

---

### 3. Generate Image
Submit a new image generation task. This is an asynchronous operation.

**Endpoint:** `POST /api/public/v1/generate`

**Content-Type:** `application/json`

**Request Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model_id` | `String` | **Yes** | The exact identifier of the model you want to use (e.g., `nano-banana-2`, `gpt-image-1.5`). |
| `prompt` | `String` | **Yes** | The text description of the image you want to generate. Max 2000 characters. |
| `ratio` | `String` | Optional | The aspect ratio of the generated image (e.g., `16:9`, `1:1`). Defaults to `1:1` if omitted. See the Models Reference below for allowed ratios per model. |
| `quality` | `String` | Optional | The quality or resolution tier of the output (e.g., `4K`, `high`). Defaults to the model's lowest/base quality (e.g., `1K` or `low`) if omitted. |
| `mode` | `String` | Optional | Specialized execution mode (e.g., `QUALITY` for GPT Image 1.5). Ignored if the model doesn't support modes. |
| `style` | `String` | Optional | The visual style preset to apply (e.g., `cinematic`, `anime`). Some models may reject invalid styles. |
| `ref_image_ids` | `Array<String>` | Optional | Array of UUIDs obtained from the Upload endpoint to use as reference images. Max 6 items (some models support fewer or none). |

**Request Body Example:**
```json
{
  "model_id": "nano-banana-2",
  "prompt": "A beautiful sunset over a cyberpunk city",
  "ratio": "16:9", // Optional (depends on model)
  "quality": "4K", // Optional (depends on model)
  "mode": "QUALITY", // Optional (depends on model)
  "style": "cinematic", // Optional (depends on model)
  "ref_image_ids": ["uuid-string-here"] // Optional (max 6 depending on model)
}
```

**Response (202 Accepted):**
```json
{
  "status": "processing",
  "generation_id": "uuid-string-here",
  "message": "Request accepted. Generation is processing in the background. Poll /generate/{id} for status."
}
```

**Rate Limiting & Billing Headers:**
The response will include headers detailing your current usage and costs:
- `X-RateLimit-Limit`: Your maximum requests per minute (RPM).
- `X-RateLimit-Cost`: The cost of this request towards your RPM.
- `X-RateLimit-Policy`: The limit policy (e.g., `15;w=60`).
- `X-Image-Price`: (Credit plans only) The IDR cost deducted for this specific model/quality combination.

If you exceed limits or lack balance, you will receive a `429 Too Many Requests` or `402 Payment Required` with an accompanying `error` message.

---

### 4. Check Generation Status
Poll this endpoint to check the status of your generation task and retrieve the final image URLs.

**Endpoint:** `GET /api/public/v1/generate/[generation_id]`

**Response Parameters:**
| Field | Type | Description |
| :--- | :--- | :--- |
| `generation_id` | `String` | The unique UUID of your generation task. |
| `status` | `String` | Current status of the task. Enum: `processing`, `success`, `failed`. |
| `progress` | `Integer` | (Only when `processing`) An integer from `0` to `100` representing percentage completion. |
| `urls` | `Array<String>` | (Only when `success`) Array containing the final generated image URL(s) securely hosted on Tencent COS. |
| `error` | `String` | (Only when `failed`) Detailed reason explaining why the generation failed. |
| `model` | `String` | The `model_id` that was used for this generation. |
| `prompt` | `String` | The prompt text that was executed. |
| `dimensions` | `Object` | The `width` and `height` of the final generated image. |
| `created_at` | `String` | ISO-8601 timestamp of when the generation was requested. |

**Response (200 OK):**
```json
{
  "generation_id": "uuid-string-here",
  "status": "success", // 'processing', 'polling', 'failed', 'success'
  "progress": 100, // Only present when processing/polling
  "urls": [
    "https://imaginer-1-XXXXXXXXXX.cos.ap-singapore.myqcloud.com/imaginer_nano-banana-2_20260421_XXXXXX_XXXXXXXX_0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=XXXXXXXXXX%2F20260421%2Fap-singapore%2Fs3%2Faws4_request&X-Amz-Date=20260421T070300Z&X-Amz-Expires=86400&X-Amz-Signature=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&X-Amz-SignedHeaders=host"
  ],
  "model": "nano-banana-2",
  "prompt": "A beautiful sunset over a cyberpunk city",
  "dimensions": {
    "width": 1024,
    "height": 576
  },
  "created_at": "2026-04-21T10:00:00Z"
}
```
*Note: The `urls` array is only populated when the status is `success`. If the status is `failed`, an `error` field will be provided with details.*

---

## Error Handling

The API uses standard HTTP status codes:
- **400 Bad Request:** Invalid payload, missing parameters, or unsupported model configurations.
- **401 Unauthorized:** Missing, invalid, or expired API Key.
- **402 Payment Required:** No active subscription or insufficient IDR credit balance.
- **403 Forbidden:** The requested model is disabled or requires a higher tier.
- **404 Not Found:** Generation ID or resource not found.
- **429 Too Many Requests:** You have exceeded your RPM limit or Concurrent Worker limit.
- **500/503:** Internal server error or maintenance mode.

## Auto-Healing JSON
The generation endpoint features an auto-healing JSON parser. If your JSON payload contains unescaped characters (like double quotes inside a prompt string), the API will attempt to repair the payload automatically before rejecting it.

---

## Available Models Reference

When calling `POST /api/public/v1/generate`, you must supply a valid `model_id`. Below is the dictionary of supported models and their specific parameters. *Tip: You can also query `GET /api/public/v1/models` to get this list programmatically.*

### 1. Nano Banana 2
- **Model ID (`model_id`)**: `nano-banana-2`
- **Supported Ratios (`ratio`)**: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`
- **Supported Qualities (`quality`)**: `1K`, `2K`, `4K`
- **Reference Images (`ref_image_ids`)**: Supported (Max 6 images)
- **Supported Styles (`style`)**: 
  `dynamic`, `creative`, `fashion`, `portrait`, `portrait-cinematic`, `portrait-fashion`, `illustration`, `3d-render`, `acrylic`, `game-concept`, `graphic-design-2d`, `graphic-design-3d`, `pro-b-w-photography`, `pro-color-photography`, `pro-film-photography`, `ray-traced`, `stock-photo`, `watercolor`, `none`

### 2. GPT Image 1.5
- **Model ID (`model_id`)**: `gpt-image-1.5`
- **Supported Ratios (`ratio`)**: `1:1`, `2:3`, `3:2`
- **Supported Qualities (`quality`)**: `low`, `medium`, `high`
- **Supported Modes (`mode`)**: `QUALITY`
- **Reference Images (`ref_image_ids`)**: Supported (Max 6 images)
- **Supported Styles (`style`)**: *(Same as Nano Banana 2)*

### 3. Flux 2.0 Pro
- **Model ID (`model_id`)**: `flux-pro-2.0`
- **Supported Ratios (`ratio`)**: `1:1`, `2:3`, `3:2`, `16:9`, `9:16`
- **Supported Qualities (`quality`)**: Not applicable
- **Reference Images (`ref_image_ids`)**: Supported (Max 4 images)
- **Supported Styles (`style`)**: *(Same as Nano Banana 2)*

### 4. Ideogram 3.0
- **Model ID (`model_id`)**: `ideogram-v3.0`
- **Supported Ratios (`ratio`)**: `1:1`, `3:4`, `4:3`
- **Supported Qualities (`quality`)**: Not applicable
- **Reference Images (`ref_image_ids`)**: **NOT SUPPORTED**
- **Supported Styles (`style`)**: 
  `dynamic`, `creative`, `fashion`, `cinematic`, `portrait`, `stock-photo`, `vibrant`

### 5. Lucid Origin
- **Model ID (`model_id`)**: `lucid-origin`
- **Supported Ratios (`ratio`)**: `1:1`, `3:4`, `4:3`, `2:3`, `3:2`, `9:16`, `16:9`
- **Supported Qualities (`quality`)**: Not applicable
- **Reference Images (`ref_image_ids`)**: Supported (Max 2 images)
- **Supported Styles (`style`)**: 
  `dynamic`, `creative`, `fashion`, `portrait`, `cinematic`, `cinematic-close-up`, `bokeh`, `film`, `food`, `hdr`, `long-exposure`, `macro`, `minimalist`, `monochrome`, `moody`, `neutral`, `retro`, `stock-photo`, `unprocessed`, `vibrant`, `none`

### 6. Seedream 4.5
- **Model ID (`model_id`)**: `seedream-4.5`
- **Supported Ratios (`ratio`)**: `1:1`, `2:3`, `4:5`, `16:9`, `21:9`, `2:1`
- **Supported Qualities (`quality`)**: Not applicable
- **Reference Images (`ref_image_ids`)**: Supported (Max 6 images)
- **Supported Styles (`style`)**: 
  `dynamic`, `creative`, `fashion`, `cinematic`, `portrait`, `stock-photo`, `vibrant`
