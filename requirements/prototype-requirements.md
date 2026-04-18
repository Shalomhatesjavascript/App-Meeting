### 1\. **Users Table**

Stores core authentication and account-level information.

**id**: `UUID` (Primary Key)

**email**: `VARCHAR(255)` (Unique) — Must end with `@student.babcock.edu.ng` or `@babcock.edu.ng`.

**password\_hash**: `TEXT` — Securely hashed password.

**role**: `ENUM` ('free', 'premium', 'admin') — Defines access levels.

**is\_verified**: `BOOLEAN` (Default: `false`) — Email verification status.

* **created\_at**: `TIMESTAMP` (Default: `NOW()`)

### 2\. **Profiles Table**

Contains detailed student information and app-specific preferences.

**user\_id**: `UUID` (Foreign Key \-\> Users.id)

**full\_name**: `VARCHAR(100)`

**gender**: `VARCHAR(20)`

**department**: `VARCHAR(100)`

**level**: `INTEGER` (e.g., 100, 200\)

**bio**: `TEXT`

**intent**: `ENUM` ('dating', 'friendship', 'networking', 'study buddy')

**is\_id\_verified**: `BOOLEAN` (Default: `false`) — For the verified badge feature.

### 3\. **Interests & UserInterests Tables**

Facilitates the interest-based matching system.

* **Interests**:  
* **id**: `SERIAL` (Primary Key)

**name**: `VARCHAR(50)` (Unique) (e.g., 'Music', 'Coding', 'Sports').

* **UserInterests**:

**user\_id**: `UUID` (Foreign Key \-\> Users.id)

**interest\_id**: `INTEGER` (Foreign Key \-\> Interests.id)

### 4\. **Photos Table**

Manages user profile images.

**id**: `UUID` (Primary Key)

**user\_id**: `UUID` (Foreign Key \-\> Users.id)

**url**: `TEXT` — Storage link to the image file.

* **is\_primary**: `BOOLEAN` — Sets the main profile photo.  
* **uploaded\_at**: `TIMESTAMP` (Default: `NOW()`)

### 5\. **Likes Table**

Tracks swipe interactions between users.

**id**: `BIGSERIAL` (Primary Key)

**from\_user\_id**: `UUID` (Foreign Key \-\> Users.id)

**to\_user\_id**: `UUID` (Foreign Key \-\> Users.id)

**is\_like**: `BOOLEAN` — `true` for Right Swipe, `false` for Pass.

**created\_at**: `TIMESTAMP` (Default: `NOW()`)

### 6\. **Matches Table**

Created when two users have a mutual "like".

**id**: `UUID` (Primary Key)

**user1\_id**: `UUID` (Foreign Key \-\> Users.id)

**user2\_id**: `UUID` (Foreign Key \-\> Users.id)

* **created\_at**: `TIMESTAMP` (Default: `NOW()`)

### 7\. **Messages Table**

Stores chat history, enabled only after a match is confirmed.

**id**: `BIGSERIAL` (Primary Key)

**match\_id**: `UUID` (Foreign Key \-\> Matches.id)

**sender\_id**: `UUID` (Foreign Key \-\> Users.id)

**content**: `TEXT`

* **is\_read**: `BOOLEAN` (Default: `false`)

**created\_at**: `TIMESTAMP` (Default: `NOW()`)

### 8\. **Subscriptions Table**

Tracks user payment status and tier-based feature limits.

**user\_id**: `UUID` (Primary Key, Foreign Key \-\> Users.id)

**tier**: `ENUM` ('free', 'premium', 'vip')

* **start\_date**: `TIMESTAMP`

**expiry\_date**: `TIMESTAMP`

**payment\_ref**: `VARCHAR(100)` — External reference from the payment gateway.

### 9\. **Admin Logs Table**

Used for moderation and auditing administrative actions.

* **id**: `BIGSERIAL` (Primary Key)  
* **admin\_id**: `UUID` (Foreign Key \-\> Users.id)

**action**: `VARCHAR(255)` (e.g., 'Banned User', 'Verified ID')

* **target\_user\_id**: `UUID` (Optional, Foreign Key \-\> Users.id)  
* **timestamp**: `TIMESTAMP` (Default: `NOW()`)
