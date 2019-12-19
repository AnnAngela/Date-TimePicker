# Usage
````typescript
import Picker from "./Picker";
const picker: Picker = new Picker();
picker.connectInput($("input"));
````
That's all. Picker will recognize the value of the input (YYYY-MM-DD HH:MM, such like 2019-12-19 16:00) and update that.

And Picker will only connect one input at the same time. So if you connect multiple times, the Picker will connect to the last one.
