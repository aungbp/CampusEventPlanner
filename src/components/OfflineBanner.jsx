import { useEffect, useState } from "react";

export function OfflineBanner() {
    // Tracks the current network status
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(()=>{
        // Update state when internet connection is restored
        function handleOnline(){
            setIsOnline(true)
        }

         // Update state when internet connection is lost
        function handleOffline(){
            setIsOnline(false)
        }
        window.addEventListener("online",handleOnline)
        window.addEventListener("offline",handleOffline)

        return () => {
            window.removeEventListener("online",handleOnline)
            window.removeEventListener("offline",handleOffline)
        }
    },[])

    // Do not display the banner when online    
    if(isOnline){
        return null
    }
    // Display a warning message when offline
    return (
        <div className="offline-banner">
            It's offline!!!
        </div>
    )
}