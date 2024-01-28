# Running k6 Scripts with the k6 Operator

This guide will walk you through the process of running k6 scripts with the k6 Operator. The k6 Operator is a Kubernetes operator designed to simplify the execution and management of k6 load testing scripts in a Kubernetes cluster.

## Prerequisites

Before proceeding, ensure that you have the following prerequisites:

- [k6](https://k6.io/) installed on your local machine
- A Kubernetes cluster up and running
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed and configured to connect to your Kubernetes cluster
- [k6 Operator](https://github.com/loadimpact/k6-operator) deployed in your Kubernetes cluster

## Step 1: Verify Local Execution

First, make sure that your k6 script runs successfully locally using the following command:

```shell
pnpm build
k6 run dist/example.js
```

Replace `dist/example.js` with the path to your k6 load testing script. Scripts should be placed in the `src` directory and will be compiled to the `dist` directory.

Ensure that your script executes without any errors or issues before proceeding to the next steps.

## Step 2: Upload Script to ConfigMap

The k6 Operator requires your k6 script to be uploaded to a ConfigMap in your Kubernetes cluster for execution. Follow the steps below to upload your script:

1. Create a ConfigMap by running the following command:

   ```shell
   kubectl create configmap k6-script --from-file=dist/example.js
   ```

   Replace `dist/example.js` with the path to your k6 load testing script.

2. Verify that the ConfigMap was created successfully by running the following command:

   ```shell
   kubectl get configmap k6-script
   ```

   You should see the newly created ConfigMap with the name "k6-script" listed.

3. Optionally, you can view the contents of the ConfigMap to ensure that your script was uploaded correctly. Run the following command:

   ```shell
   kubectl describe configmap k6-script
   ```

   The output should display the details of the ConfigMap, including the data section where your script is stored.

## Step 3: Deploy k6 Load Test

Now that your k6 script is uploaded as a ConfigMap, you can deploy the k6 load test using the k6 Operator by creating a Custom Resource (CR) of type `K6`.

1. Create a new file named `k6_test.yaml` and copy the following content into it:

    ```yaml
    apiVersion: k6.io/v1alpha1
    kind: K6
    metadata:
      name: k6-example
    spec:
      parallelism: 1
      script:
        configMap:
          name: k6-script
          # Replace 'example.js' with the name of the script you want to run
          file: example.js
      arguments:  --tag my-tag=my-value
    ```

2. In the `spec` section of the CR:

   - Update the `name` and `file` fields under `script` to match the name of your ConfigMap and the script file name respectively.
   - Replace the `image` field under `runner` with the image of the k6 Operator you have deployed.

3. Save the changes to the `k6_test.yaml` file.

4. Apply the CR by running the following command:

    ```shell
    kubectl apply -f k6_test.yaml
    ```

5. Verify that the k6 load test was created successfully by running:

    ```shell
    kubectl get k6
    ```

You should see the newly created k6 resource with the name "k6-example" listed.

1. Monitor the k6 load test execution using the following command:

    ```shell
    kubectl logs -f <k6-pod-name>
    ```

Replace `<k6-pod-name>` with the name of the k6 pod associated with your k6 resource. You can find the pod name by running `kubectl get pods`.

## Conclusion

You have successfully deployed a k6 load test using the k6 Operator. You can now use the k6 Operator to run your k6 scripts in a Kubernetes cluster.
