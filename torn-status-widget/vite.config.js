   // vite.config.js
   import { defineConfig } from 'vite';

   export default defineConfig({
     // Tell Vite that your source files (including index.html) are in the 'src' directory
     root: 'src', //
     server: {
       port: 5173, // Should match tauri.conf.json devPath port
       strictPort: true, // Ensures Vite uses this port or fails
     },
     build: {
       // Output directory relative to the 'root' (which is 'src').
       // So, '../dist' will place the 'dist' folder at the project root level.
       // This aligns with tauri.conf.json's frontendDist: "../dist" (which is relative to src-tauri).
       outDir: '../dist', //
       emptyOutDir: true, //
     },
     optimizeDeps: {
       include: [
         '@tauri-apps/api/notification', // Explicitly include the notification API
         // You might need to add other problematic deep imports here if they arise
         '@tauri-apps/api/window',
         '@tauri-apps/api/core',
         // Note: Plugins like @tauri-apps/plugin-store are usually handled well automatically
       ]
     }
   });
