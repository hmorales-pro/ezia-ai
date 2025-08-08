# How to Find Your MongoDB Cluster Name

To find your MongoDB cluster name for the connection string:

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/

2. **Sign in** with your MongoDB account

3. **Look at your clusters** - The cluster name appears in the main dashboard

4. **Connection String Format**:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

   Your credentials:
   - Username: `your-username`
   - Password: `your-password`
   - Cluster name: **You need to find this in MongoDB Atlas**

5. **Common cluster names**:
   - `cluster0` (default for new clusters)
   - `Cluster0` (case-sensitive!)
   - Custom names you may have set

6. **To get the exact connection string**:
   - Click on your cluster
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## Quick Test

Once you have the correct cluster name, update your `.env.local`:

```bash
MONGODB_URI=mongodb+srv://your-username:your-password@<YOUR-CLUSTER-NAME>.mongodb.net/your-database?retryWrites=true&w=majority
```

Then test the connection:
```bash
node test-business-creation.js
```