## Local Deployment for insta-QR

### Step 1: Clone the Repository

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Junnygram/qr-code/tree/start
   cd qr-code
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

---

### Next Steps: Deploying on AWS Elastic Kubernetes Service (EKS)

#### Step 1: Push Docker Images to Amazon ECR

1. **Locate Docker Images**
   Use the following command to search for images with `insta_qr` in their names:

   ```bash
   docker ps -a | grep "insta_qr"
   ```

2. **Log In to ECR**
   Authenticate Docker to your ECR registry:

   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Create ECR Repositories**
   Create repositories for the frontend and backend images:

   ```bash
   aws ecr create-repository --repository-name insta_qr-frontend --region us-east-1
   aws ecr create-repository --repository-name insta_qr-backend --region us-east-1
   ```

4. **Tag and Push Images**
   Tag the frontend and backend images, then push them to ECR:

   ```bash
   docker tag insta_qr-frontend:latest <account_id>.dkr.ecr.us-east-1.amazonaws.com/insta_qr-frontend:latest
   docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/insta_qr-frontend:latest

   docker tag insta_qr-backend:latest <account_id>.dkr.ecr.us-east-1.amazonaws.com/insta_qr-backend:latest
   docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/insta_qr-backend:latest
   ```

---

#### Step 2: Create an Amazon EKS Cluster

An Amazon EKS cluster serves as the foundation for running your Kubernetes workloads. Within the cluster, you can define deployments, pods, services, ingresses, and other Kubernetes resources to manage your application.

1. **Install Required Tools**

   - Install the official Kubernetes CLI tool, `kubectl`.
   - Install `eksctl`, a CLI tool to manage EKS clusters.
   - Refer to their [official documentation](https://kubernetes.io/docs/tasks/tools/) for installation steps.

2. **Set Up the EKS Cluster**

   - Follow AWS's EKS setup documentation to create a cluster with proper node groups, networking, and IAM roles.

3. **Deploy the Application**
   - Apply Kubernetes manifests (e.g., deployments, services) using `kubectl`.
   - Ensure the application connects to your ECR-hosted Docker images.

Let me know if you'd like detailed steps for setting up Kubernetes manifests or automating this process!

### **Step 1: Create the EKS Cluster**

The command you provided:

```bash
eksctl create cluster \
  --name insta-qr-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 3

```

- **`eksctl create cluster`**: This command creates an Amazon EKS cluster.
- **`--name insta-qr-cluster`**: The cluster will be named `insta-qr-cluster`.
- **`--region us-east-1`**: The cluster will be deployed in the `us-east-1` AWS region.
- **`--nodegroup-name standard-workers`**: Defines a worker node group with the name `standard-workers`.
- **`--node-type t3.medium`**: Specifies the EC2 instance type to use for the worker nodes (in this case, `t3.medium`).
- **`--nodes 3`**: Initially creates 3 nodes in the worker node group.
- **`--nodes-min 1 --nodes-max 3`**: Ensures that the number of nodes will be within the range of 1 to 3, allowing auto-scaling if required.

This process typically takes about **10 minutes** to complete.

---

### **Step 2: Update Kubernetes Config**

Once the cluster is created, the following command updates your local Kubernetes config to communicate with the newly created EKS cluster:

```bash
aws eks update-kubeconfig --region us-east-1 --name insta-qr-cluster
```

- **`aws eks update-kubeconfig`**: Configures `kubectl` (the Kubernetes CLI tool) to interact with the EKS cluster.
- **`--region us-east-1`**: Specifies the AWS region where your cluster is deployed.
- **`--name insta-qr-cluster`**: Specifies the name of the EKS cluster to use for the `kubectl` context.

After running this command, you can interact with your EKS cluster using `kubectl` commands.

---

### **Step 3: Apply Kubernetes Deployment and Service Configurations**

You have two deployment configurations: one for the frontend (`frontend.yml`) and one for the backend (`backend.yml`).

#### **frontend.yml**

The `frontend.yml` manifest contains two resources: a **Deployment** and a **Service**.

1. **Deployment:**

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: frontend-deployment
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: frontend
     template:
       metadata:
         labels:
           app: frontend
       spec:
         imagePullSecrets:
           - name: regcred
         containers:
           - name: frontend-container
             image: '307946680662.dkr.ecr.us-east-1.amazonaws.com/insta_qr-frontend'
             imagePullPolicy: Always
             ports:
               - containerPort: 3000
   ```

   - **`Deployment`**: This defines the deployment of your frontend application.
   - **`replicas: 1`**: It specifies that only 1 pod should be running for the frontend application (you can scale this based on traffic).
   - **`image`**: The container image for the frontend is pulled from Amazon ECR (Elastic Container Registry).
   - **`imagePullPolicy: Always`**: This ensures that Kubernetes always pulls the latest version of the image from ECR.
   - **`ports`**: Exposes port 3000 inside the container, which is the port your frontend application is listening on.

2. **Service:**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: frontend-service
   spec:
     type: LoadBalancer
     selector:
       app: frontend
     ports:
       - protocol: TCP
         port: 80
         targetPort: 3000
   ```
   - **`Service`**: This exposes your frontend application to the outside world.
   - **`type: LoadBalancer`**: Specifies that the service will be exposed via an AWS load balancer (which will route external traffic to your frontend).
   - **`port: 80`**: Exposes port 80 for HTTP traffic.
   - **`targetPort: 3000`**: Forwards traffic from port 80 to port 3000 inside the frontend container.

#### **backend.yml**

The `backend.yml` manifest also contains two resources: a **Deployment** and a **Service**.

1. **Deployment:**

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: backend-deployment
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: backend
     template:
       metadata:
         labels:
           app: backend
           monitoring: enabled
       spec:
         containers:
           - name: backend-container
             image: '307946680662.dkr.ecr.us-east-1.amazonaws.com/insta_qr-backend'
             imagePullPolicy: Always
             ports:
               - containerPort: 8000
   ```

   - **`Deployment`**: This defines the deployment of your backend application.
   - **`replicas: 1`**: Similar to the frontend, only 1 replica is being created for the backend (you can scale this based on demand).
   - **`image`**: The backend container image is also pulled from Amazon ECR.
   - **`imagePullPolicy: Always`**: Ensures that the backend container image is always updated.
   - **`ports`**: Exposes port 8000 inside the container, which is where the backend application listens for incoming requests.

2. **Service:**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: backend-service
     labels:
       app: backend
       monitoring: enabled
   spec:
     selector:
       app: backend
     ports:
       - protocol: TCP
         port: 8000
         targetPort: 8000
         name: http
     type: ClusterIP
   ```
   - **`Service`**: This defines how the backend will be exposed within the Kubernetes cluster.
   - **`type: ClusterIP`**: This makes the service accessible only within the Kubernetes cluster.
   - **`port: 8000`**: Exposes port 8000 for internal communication.
   - **`targetPort: 8000`**: Routes traffic from port 8000 to port 8000 inside the container.

---

### **Step 4: Apply the Configuration**

Once the cluster is ready and the config is updated, apply the deployment and service configurations with:

```bash
kubectl apply -f frontend.yml
kubectl apply -f backend.yml
```

This will create the necessary deployments and services for both your frontend and backend.

---

### **Summary**

- **Frontend Deployment**: Creates a pod running the frontend application and exposes it via an external LoadBalancer.
- **Backend Deployment**: Creates a pod running the backend API, which is only accessible internally within the cluster.
- **Frontend and Backend Services**: Expose the pods for external and internal communication respectively, with the frontend service being LoadBalancer-type and the backend service being ClusterIP-type.

implementing reverse proxy

Reverse Proxy in NextJS

To enable communication between the two pods, and because our frontend uses NextJS, we will be utilizing the reverse proxy in NextJS to forward requests from the frontend service to the backend.

    You can find the configuration in the “frontend/next.config.js“ file. replace the placeholder with the name of your backend service

Reverse Proxy

    Position: Sits between the client (user) and the server but in front of the web servers (i.e., on the server side).

    Purpose: The reverse proxy is used to manage and distribute requests to multiple backend servers on behalf of the server. The client doesn't know which server will respond; it interacts only with the reverse proxy.

    Use Cases:
        Load balancing: Distributes incoming traffic among several backend servers to ensure even load distribution.
        Security: Can act as a security barrier between the client and backend servers (e.g., hiding server details, protecting against DDoS attacks).
        SSL termination: Handles SSL encryption/decryption, offloading this task from backend servers.
        Caching: Caches content to improve server performance.

    Example: A reverse proxy might be used to route requests to different microservices or backend servers based on the URL path or load distribution.


     now we
     Update the Frontend Code to use the proxy and rebuild your docker image using the push commands to have the latest changes updated to your container image repository.

```

     aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-east-1.amazonaws.com
     docker tag insta_qr-frontend:latest <account_id>.dkr.ecr.us-east-1.amazonaws.com/insta_qr-frontend:latest
      docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/insta_qr-frontend:latest
```

eg.
change from this
const response = await fetch('http://localhost:8000/generate-qr-image/',

to this
const response = await fetch('/api/proxy-image',

    Also, ensure that the bucket policy allows access.

{
"Version": "2012-10-17",
"Statement": [
{
"Effect": "Allow",
"Principal": {
"AWS": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/eksctl-instaQR-eks-cluster-nodegro-NodeInstanceRole-I0cyWLXl1M91"
},
"Action": "s3:PutObject",
"Resource": "arn:aws:s3:::qr-codes-generator/*"
}
]
}

restart the Kubernetes deployment to pick up the latest changes.

kubectl rollouut restart deployment

. Find the IAM Role for Your EKS Worker Nodes

The IAM role you need corresponds to the role created when you set up your EKS cluster with eksctl. It typically has a name like eksctl-<cluster-name>-NodeInstanceRole.
Option 1: Using AWS Management Console

    Go to the IAM Console in AWS.
    In the left-hand navigation pane, click Roles.
    Search for a role with the name eksctl-<your-cluster-name>-NodeInstanceRole. For example, if your cluster is named instaQR, the role would likely be named eksctl-insta-qr-cluster-nodegroup--NodeInstanceRole.
    Click on the role to view its details.
    Copy the Role ARN at the top of the role's summary page. It will look something like:


    arn:aws:iam::307946680662:role/eksctl-insta-qr-cluster-nodegroup--NodeInstanceRole-eqGBUfwgnsJr

Here's the policy with sensitive information removed, ready to be added to your documentation:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<your-bucket-name>/*"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "<role-arn>"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<your-bucket-name>/*"
    }
  ]
}
```

### Explanation of placeholders:

- `<your-bucket-name>`: Replace this with the actual name of your S3 bucket.
- `<role-arn>`: Replace this with the ARN of the IAM role you want to grant `s3:PutObject` permissions.

This version removes sensitive information like specific IAM role ARNs and bucket names, so it can be safely shared in your documentation.

kubectl rollout restart deployment

To delete an EKS cluster and everything associated with it, follow these steps:
Using eksctl

The simplest way to delete the cluster and all associated resources (e.g., nodes, node groups, VPC) is with eksctl:

```
   eksctl delete cluster --name insta-qr-cluster --region us-east-1
```

To install Helm, Prometheus, and Grafana on macOS, follow these steps:

### 1. **Install Helm**

First, you need to install Helm on your macOS system. The following method uses Homebrew, which is the easiest way to install Helm.

```bash
brew install helm
```

If you don't have Homebrew installed, you can install it from [here](https://brew.sh/).

### 2. **Add Helm Repositories for Prometheus and Grafana**

After Helm is installed, add the Prometheus and Grafana Helm repositories.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
```

### 3. **Update Helm Repositories**

Make sure the Helm repositories are up-to-date.

```bash
helm repo update
```

### 4. **Install Prometheus using Helm**

Now you can install Prometheus using Helm.

```bash
helm install prometheus prometheus-community/kube-prometheus-stack
```

This will install the `kube-prometheus-stack` which includes Prometheus, Alertmanager, and Grafana.

### 5. **Install Grafana using Helm**

You can install Grafana with Helm as well.

```bash
helm install grafana grafana/grafana
```

This will install Grafana with the default settings.

After installation, you can check the status of your installations using:

```bash
helm list
```

kubectl get all

Expose Prometheus and Grafana
We can either port-forward for development use or a load balancer for Production use. but for this article, we will be port-forwarding

# Prometheus

kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090

# Grafana

kubectl port-forward svc/prometheus-grafana 3000:80

Expose Prometheus and Grafana
We can either port-forward for development use or a load balancer for Production use. but for this article, we will be port-forwarding

# Prometheus

kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090

# Grafana

kubectl port-forward svc/prometheus-grafana 3000:80

Apply the ServiceMonitor updates and restart deployments.

kubectl apply -f service_monitor.yml
kubectl rollout restart deployment

Navigate to Status > Targets and check if the backend Service is listed.

on grafana
home> connetcion > prometheus

kubectl rollout restart deployment

To delete an EKS cluster and everything associated with it, follow these steps:
Using eksctl

The simplest way to delete the cluster and all associated resources (e.g., nodes, node groups, VPC) is with eksctl:

```
   eksctl delete cluster --name insta-qr-cluster --region us-east-1
```
