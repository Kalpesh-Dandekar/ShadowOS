import { app } from "./app.js";
import { environment } from "./config/environment.js";

app.listen(environment.apiPort, () => {
  console.log(`ShadowOS API listening on port ${environment.apiPort}`);
});
