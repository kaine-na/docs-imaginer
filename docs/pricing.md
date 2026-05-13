# Pricing & Rate Limits

The Imaginer API provides two main subscription plans which determine your concurrency and request limits. Each request to the API consumes RPM (Requests Per Minute) and Worker slots based on the model and quality chosen.

## Account Plans

| Plan | RPM Limit | Concurrent Worker Limit |
| :--- | :--- | :--- |
| **Unlimited** | 5 | 5 |
| **Credits** | 1000 | 35 |

*Note: RPM Limit is the maximum number of requests you can make in a minute. Concurrent Worker Limit is the maximum number of images you can generate simultaneously.*

---

## Model Cost & Pricing

When on the Credits plan, each request deducts IDR from your balance. The table below details the cost per request for each model and quality setting.

| Model | Quality | RPM Cost | Worker Cost | Harga (IDR) |
| :--- | :--- | :--- | :--- | :--- |
| **FLUX 2.0 PRO** | `DEFAULT` | 1 | 1 | 75 |
| **GPT IMAGE 1.5** | `HIGH` | 3 | 3 | 175 |
| **GPT IMAGE 1.5** | `MEDIUM` | 2 | 2 | 125 |
| **GPT IMAGE 1.5** | `LOW` | 1 | 1 | 75 |
| **GPT IMAGE 2** | `MEDIUM` | 3 | 3 | 200 |
| **GPT IMAGE 2** | `LOW` | 1 | 1 | 75 |
| **IDEOGRAM 3.0** | `DEFAULT` | 1 | 1 | 75 |
| **LUCID ORIGIN** | `DEFAULT` | 1 | 1 | 75 |
| **NANO BANANA 2** | `4K` | 3 | 3 | 175 |
| **NANO BANANA 2** | `2K` | 2 | 2 | 125 |
| **NANO BANANA 2** | `1K` | 1 | 1 | 75 |
| **SEEDREAM 4.5** | `DEFAULT` | 1 | 1 | 75 |
| **RECRAFT V4** | `DEFAULT` | 3 | 3 | 200 |
