# Video Chat Application

A professional Django-based video chat application with real-time communication, WebRTC support, and modern UI design.

## Features

- **User Authentication**: Secure login/register/logout system
- **Video Chat Rooms**: Create or join rooms using unique invite codes
- **WebRTC Integration**: High-quality video and audio streaming
- **Real-time Chat**: Text messaging during video calls
- **Screen Sharing**: Share your screen with other participants
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Beautiful blue and white theme with smooth animations
- **Participant Management**: View and manage room participants
- **WebSocket Support**: Real-time signaling and communication

## Technology Stack

- **Backend**: Django 5.2.5
- **WebSockets**: Django Channels
- **Video/Audio**: WebRTC
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Bootstrap 5.3.0, Custom CSS
- **Icons**: Font Awesome 6.4.0
- **Database**: SQLite (default), supports PostgreSQL/MySQL

## Prerequisites

- Python 3.8+
- pip (Python package installer)
- Modern web browser with WebRTC support

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd videoAppChat
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

7. **Open your browser**
   Navigate to `http://127.0.0.1:8000/`

## Usage

### Getting Started

1. **Register an account** or **login** if you already have one
2. **Create a new room** or **join an existing room** using an invite code
3. **Start a call** to enable video and audio
4. **Use the controls** to mute/unmute, turn video on/off, and share your screen
5. **Chat with participants** using the sidebar chat feature

### Room Management

- **Creating Rooms**: Click "Create Room" and provide a name and description
- **Joining Rooms**: Use the 8-character invite code provided by room creators
- **Sharing Rooms**: Copy the invite code and share it with others
- **Leaving Rooms**: Click "Leave Room" to exit and return to the home page

### Video Call Controls

- **Start Call**: Begin video and audio streaming
- **End Call**: Stop the call and release media devices
- **Mute/Unmute**: Toggle microphone on/off
- **Video On/Off**: Toggle camera on/off
- **Screen Share**: Share your screen with other participants

### Chat Features

- **Real-time Messaging**: Send and receive messages instantly
- **Participant List**: View all users currently in the room
- **Tabbed Interface**: Switch between participants and chat views

## Project Structure

```
videoAppChat/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── README.md                # This file
├── videoAppChat/            # Main project settings
│   ├── __init__.py
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   ├── asgi.py              # ASGI configuration for WebSockets
│   └── wsgi.py              # WSGI configuration
├── videoChats/              # Main application
│   ├── __init__.py
│   ├── admin.py             # Django admin configuration
│   ├── apps.py              # App configuration
│   ├── models.py            # Database models
│   ├── views.py             # View functions
│   ├── urls.py              # App URL patterns
│   ├── forms.py             # Form classes
│   ├── consumers.py         # WebSocket consumers
│   └── routing.py           # WebSocket routing
├── templates/                # HTML templates
│   └── videoChats/
│       ├── base.html        # Base template
│       ├── home.html        # Home page
│       ├── login.html       # Login form
│       ├── register.html    # Registration form
│       ├── create_room.html # Room creation form
│       ├── join_room.html   # Room joining form
│       └── room_detail.html # Video chat room
└── static/                   # Static files
    └── js/
        └── video-chat.js    # Main JavaScript functionality
```

## Configuration

### Environment Variables

Create a `.env` file in the project root for environment-specific settings:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
```

### Database Configuration

The default configuration uses SQLite. To use PostgreSQL or MySQL, update the `DATABASES` setting in `settings.py`.

### WebSocket Configuration

The application uses Django Channels with an in-memory channel layer by default. For production, consider using Redis as the channel layer backend.

## Development

### Running Tests

```bash
python manage.py test
```

### Code Style

The project follows PEP 8 Python style guidelines. Use a linter like `flake8` or `black` for code formatting.

### Adding New Features

1. Create models in `models.py`
2. Add views in `views.py`
3. Create templates in the `templates/` directory
4. Update URL patterns in `urls.py`
5. Add JavaScript functionality in `static/js/`

## Production Deployment

### Requirements

- Web server (Nginx, Apache)
- Application server (Gunicorn, uWSGI)
- Database (PostgreSQL, MySQL)
- Redis (for WebSocket support)
- SSL certificate (HTTPS)

### Deployment Steps

1. **Set production settings**
   ```python
   DEBUG = False
   ALLOWED_HOSTS = ['yourdomain.com']
   ```

2. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

3. **Configure your web server**
4. **Set up SSL/HTTPS**
5. **Configure environment variables**

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Camera/Microphone not working**
   - Ensure browser permissions are granted
   - Check if other applications are using the devices

2. **WebSocket connection failed**
   - Verify the server is running
   - Check firewall settings

3. **Video quality issues**
   - Check internet connection
   - Reduce browser tab count
   - Close other video applications

### Debug Mode

Enable debug mode in `settings.py` for detailed error messages during development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Acknowledgments

- Django team for the excellent web framework
- Django Channels for WebSocket support
- WebRTC community for the technology
- Bootstrap team for the UI framework
