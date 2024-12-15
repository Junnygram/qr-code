## Local Deployment for insta-QR

### Step 1: Clone the Repository

1. Clone the repository to your local machine:
   ```bash
   git clone <repository_url>
   cd insta-QR
   ```

---

### Step 2: Set Up and Test the Backend

1. **Install Dependencies**  
   Navigate to the backend folder and install the Python packages:

   ```bash
   cd backend
   python3 -m pip install -r requirements.txt
   ```

2. **Configure AWS Credentials**  
   Ensure your AWS credentials are properly configured in `~/.aws/credentials`:

   ```plaintext
   [default]
   aws_access_key_id = <your-access-key>
   aws_secret_access_key = <your-secret-access-key>
   ```

3. **Set Up S3 Bucket**

   - Create an S3 bucket named `qr-codes-generator`. Update `bucket_name` in `backend/main.py` if a different name is used.
   - Enable public access and add the following bucket policy for public read access:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::qr-codes-generator/*"
         }
       ]
     }
     ```

4. **Run the Backend Locally**  
   Start the backend server:
   ```bash
   python main.py
   ```

---

### Step 3: Set Up and Test the Frontend

1. **Install Dependencies**  
   Navigate to the frontend folder and install Node.js packages:

   ```bash
   cd ../frontend
   npm install
   ```

2. **Run the Frontend Locally**  
   Start the development server:
   ```bash
   npm run dev
   ```

---

### Step 4: Containerize and Run with Docker Compose

1. **Create a `.env` File**  
   Add your AWS credentials in the root `.env` file:

   ```env
   AWS_ACCESS_KEY_ID=<your-access-key>
   AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
   AWS_REGION=<your-region>
   S3_BUCKET_NAME=qr-codes-generator
   ```

2. **Run Docker Compose**  
   Build and run the containers:

   ```bash
   docker-compose up --build
   ```

   To stop the containers:

   ```bash
   docker-compose down
   ```

3. **Testing**
   - Access the application at `http://localhost:3000`.
   - Upload QR codes and verify they appear in your S3 bucket.

---

### Notes and Tips:

- If `pip install -r requirements.txt` fails, use:
  ```bash
  python3 -m pip install -r requirements.txt
  ```
- Ensure the `bucket_name` in `backend/main.py` matches the S3 bucket name.
- You can rerun the containers later without rebuilding by running:
  ```bash
  docker-compose up -d
  ```

This workflow ensures a seamless local deployment and makes the project ready for production deployment. Let me know if you need more details or troubleshooting tips!

Next Up is to deploy the application on AWS Elastic Kubernetes Service (EKS).
