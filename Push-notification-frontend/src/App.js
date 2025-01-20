import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { AddPhotoAlternate } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

const PushNotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [eventName, setEventName] = useState("");
  const [additionalFields, setAdditionalFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    const websocket = new WebSocket("ws://10.5.58.202:5001?userId=admin"); // Replace with your server IP
    setWs(websocket);

    websocket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications((prev) => [...prev, notification]);
      alert(`New notification: ${notification.message}`);
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const sendNotification = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://10.5.58.202:5001/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          image,
          eventName,
          additionalFields,
          userId: "12345", // Replace with the target user's ID
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setTitle("");
        setMessage("");
        setImage("");
        setEventName("");
        setAdditionalFields({});
        alert(result.message);
      } else {
        alert("Failed to send notification");
      }
    } catch (err) {
      alert("Error sending notification");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const scheduleNotification = () => {
    alert("Schedule notification feature is not yet implemented.");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "title", headerName: "Title", width: 200 },
    { field: "message", headerName: "Message", width: 400 },
    { field: "eventName", headerName: "Event Name", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: "20px", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Push Notification Dashboard
        </Typography>

        {/* Notification Form */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Send New Notification
                </Typography>
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ marginBottom: "10px" }}
                />
                <TextField
                  label="Message"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ marginBottom: "10px" }}
                />
                <TextField
                  label="Image URL"
                  variant="outlined"
                  fullWidth
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  sx={{ marginBottom: "10px" }}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button variant="contained" component="span" color="primary" startIcon={<AddPhotoAlternate />} fullWidth sx={{ marginBottom: "10px" }}>
                    Upload Image
                  </Button>
                </label>
                <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                  <InputLabel>Event Name</InputLabel>
                  <Select
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    label="Event Name"
                  >
                    <MenuItem value="Event 1">Event 1</MenuItem>
                    <MenuItem value="Event 2">Event 2</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendNotification}
                  fullWidth
                  disabled={loading || !message}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Send Notification"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Schedule Notification */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Schedule Notification
                </Typography>
                <TextField
                  label="Message"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ marginBottom: "10px" }}
                />
                <TextField
                  label="Scheduled Time"
                  type="datetime-local"
                  value={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setAdditionalFields({ ...additionalFields, time: e.target.value })}
                  sx={{ marginBottom: "10px", width: "100%" }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={scheduleNotification}
                  fullWidth
                  disabled={loading || !message}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Schedule Notification"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Notifications Table */}
        <Typography variant="h5" sx={{ marginTop: "40px", marginBottom: "20px" }}>
          Past Notifications
        </Typography>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={notifications}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            loading={loading}
          />
        </div>
      </Box>
    </Container>
  );
};

export default PushNotificationPanel;

// import React, { useState, useEffect } from "react";
// import { fetchItems } from "./api";
// import AddItem from "./components/AddItem";
// import ItemList from "./components/ItemList";

// const App = () => {
//   const [items, setItems] = useState([]);

//   const getItems = async () => {
//     const { data } = await fetchItems();
//     setItems(data);
//   };

//   useEffect(() => {
//     getItems();
//   }, []);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>CRUD App</h1>
//       <AddItem onAdd={getItems} />
//       <ItemList items={items} onUpdate={getItems} onDelete={getItems} />
//     </div>
//   );
// };

// export default App;
