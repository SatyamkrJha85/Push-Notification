package com.example.notification

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.example.notification.ui.theme.NotificationTheme
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    private lateinit var webSocketClient: WebSocketClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Create a notification channel (required for Android 8.0+)
        createNotificationChannel()

        // Request notification permissions (required for Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
            }
        }

        // Get Firebase Messaging Token (optional, for FCM integration)
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                Log.d("FCM", "FCM Token: $token")
                // TODO: Send the token to your server
            } else {
                Log.e("FCM", "Fetching FCM token failed", task.exception)
            }
        }

        // Enable edge-to-edge display
        enableEdgeToEdge()

        // Set up the UI
        setContent {
            NotificationTheme {
              NotificationApp()
            }
        }

        // Initialize WebSocket Client
        val userId = "12345" // Replace with your user ID logic
        webSocketClient = WebSocketClient(userId, this)
        Log.d("MainActivity", "WebSocketClient initialized: $webSocketClient")
        webSocketClient.connect()
    }

    override fun onDestroy() {
        super.onDestroy()
        webSocketClient.disconnect()
    }

    // Create a notification channel (required for Android 8.0+)
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "notification_channel_id", // Channel ID
                "Notification Channel", // Channel Name
                NotificationManager.IMPORTANCE_HIGH // Importance level
            ).apply {
                description = "Channel for receiving notifications"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 250, 500) // Custom vibration pattern
                setSound(
                    Uri.parse("android.resource://${packageName}/${R.raw.notification_sound}"), // Custom sound
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}

// WebSocket Client Class
class WebSocketClient(
    private val userId: String,
    private val context: Context
) : WebSocketListener() {
    private val TAG = "WebSocketClient"
    private var webSocket: WebSocket? = null

    // Connect to the WebSocket server
    fun connect() {
        val client = OkHttpClient.Builder()
            .readTimeout(30, TimeUnit.SECONDS)
            .connectTimeout(10, TimeUnit.SECONDS)
            .build()

        val request = Request.Builder()
            .url("ws://10.5.58.202:5001?userId=$userId") // Replace with your server IP
            .build()

        webSocket = client.newWebSocket(request, this)
    }

    // Disconnect from the WebSocket server
    fun disconnect() {
        webSocket?.close(1000, "Closing connection")
    }

    // Handle WebSocket connection opened
    override fun onOpen(webSocket: WebSocket, response: Response) {
        Log.d(TAG, "WebSocket connection opened")
    }

    // Handle incoming WebSocket messages
    override fun onMessage(webSocket: WebSocket, text: String) {
        Log.d(TAG, "Received message: $text")

        // Parse the JSON message
        val json = Json.parseToJsonElement(text) as? JsonObject
        if (json != null) {
            val title = json["title"]?.jsonPrimitive?.content ?: "New Notification"
            val message = json["message"]?.jsonPrimitive?.content ?: "You have a new notification"
            val image = json["image"]?.jsonPrimitive?.content
            val eventName = json["eventName"]?.jsonPrimitive?.content

            // Show a notification
            showNotification(title, message, image, eventName)
        } else {
            Log.e(TAG, "Failed to parse JSON message")
        }
    }

    // Handle WebSocket connection closed
    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
        Log.d(TAG, "WebSocket connection closed: $reason")
    }

    // Handle WebSocket connection failure
    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        Log.e(TAG, "WebSocket connection failed", t)
    }

    // Show a notification in the system tray
    private fun showNotification(title: String, message: String, image: String?, eventName: String?) {
        Log.d(TAG, "Attempting to show notification: $title - $message")

        val notificationManager = NotificationManagerCompat.from(context)

        // Create an intent to open the app when the notification is clicked
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Build the notification
        val notificationBuilder = NotificationCompat.Builder(context, "notification_channel_id")
            .setSmallIcon(R.drawable.notifications) // Replace with your notification icon
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent) // Add a click action

        // Add event name if available
        if (!eventName.isNullOrEmpty()) {
            notificationBuilder.setSubText("Event: $eventName")
        }

        // Show the notification
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e(TAG, "Notification permission not granted")
            return
        }
        notificationManager.notify(1, notificationBuilder.build())
        Log.d(TAG, "Notification shown successfully")
    }
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationApp() {
    // Dummy list of notifications
    val notifications = listOf(
        Notification(
            title = "New Update",
            message = "Your app has been updated to version 2.0.",
            timestamp = "2 hours ago"
        ),
        Notification(
            title = "Reminder",
            message = "Don't forget to complete your daily tasks.",
            timestamp = "5 hours ago"
        ),
        Notification(
            title = "Welcome",
            message = "Thank you for installing our app!",
            timestamp = "1 day ago"
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Notifications",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    // Handle FAB click (e.g., open a dialog to send a new notification)
                },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Notification")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (notifications.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No notifications yet.",
                        fontSize = 18.sp,
                        color = Color.Gray
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(notifications) { notification ->
                        NotificationCard(notification)
                    }
                }
            }
        }
    }
}

@Composable
fun NotificationCard(notification: Notification) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = notification.title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = notification.message,
                fontSize = 14.sp,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = notification.timestamp,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

data class Notification(
    val title: String,
    val message: String,
    val timestamp: String
)