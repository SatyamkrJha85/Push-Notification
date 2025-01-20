
#### Body Params
- `idfv` (object): Contains the device’s unique identifier.
- `lang` (string): Required. Device locale used for authentication and probabilistic modeling.
- `att_status` (int32): App Tracking Transparency status (relevant for iOS 14 and above).
- `is_first` (string): Required. Indicates if it's the first app launch.
- `open_referrer` (string): The app from which the current app was opened.
- `ip` (string): Required. The device IP Address (IPv4).
- `os` (string): Required. Device OS version used for authentication.
- `timestamp` (string): Required. ISO 8601 UTC format timestamp.
- `type` (string): Required. Device type/model used for authentication.
- `idfa` (object): IDFA object with the following fields:
  - `sharing_filter` (string)
  - `request_id` (string): Required. A unique identifier for the app install.

### Example Request

Here’s an example of how to format the body of the request:

```json
{
  "idfv": {
    "lang": "en",
    "att_status": 1,
    "is_first": "false",
    "open_referrer": "app_name",
    "ip": "192.168.1.1",
    "os": "iOS 14.4",
    "timestamp": "2025-01-06T12:00:00Z",
    "type": "iPhone12,1",
    "idfa": {
      "sharing_filter": "allow",
      "request_id": "unique_request_id"
    }
  }
}
