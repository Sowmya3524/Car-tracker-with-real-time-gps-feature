# Test Drive Vehicle Tracking System - Flowchart

## System Overview

This document outlines the complete workflow for the Test Drive Vehicle Tracking System, showing the interaction between Customers, CRE Dashboard, and Test Drivers.

---

## Main Process Flow

```mermaid
flowchart TB
    subgraph CUSTOMER["👤 CUSTOMER"]
        C1["Customer Requests Test Drive"]
        C2["Provides Details:<br/>• Name<br/>• Mobile Number<br/>• Address (Door No., Street, Area)<br/>• Preferred Car Model"]
    end

    subgraph CRE["🖥️ CRE DASHBOARD"]
        D1["CRE Receives Customer Request"]
        D2["Dashboard Displays:<br/>• Customer Name<br/>• Mobile Number<br/>• Complete Address<br/>• Requested Car Model"]
        D3["CRE Pinpoints Customer<br/>Location on Map"]
        D4["CRE Assigns Available<br/>Test Driver"]
        D5["Location & Customer Details<br/>Shared with Test Driver"]
        D6["Car Model Displayed<br/>at Dashboard Bottom"]
    end

    subgraph DRIVER["📱 TEST DRIVER APP (Android)"]
        T1["Driver Receives Assignment<br/>Notification"]
        T2["Views Customer Details:<br/>• Name & Mobile<br/>• Exact Pin Location<br/>• Address Details<br/>• Car Model to Bring"]
        T3["GPS Tracking Activated"]
        T4["Driver Navigates to<br/>Customer Location"]
        T5["Driver's Real-time Location<br/>Visible to CRE"]
    end

    C1 --> C2
    C2 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D6
    D6 --> D4
    D4 --> D5
    D5 --> T1
    T1 --> T2
    T2 --> T3
    T3 --> T4
    T4 --> T5
    T5 -.->|"Real-time GPS Updates"| D3

    style CUSTOMER fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style CRE fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style DRIVER fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

---

## Detailed Component Diagram

```mermaid
flowchart LR
    subgraph INPUT["📝 Customer Input"]
        I1["Name"]
        I2["Mobile Number"]
        I3["Door No."]
        I4["Street"]
        I5["Area/Locality"]
        I6["City"]
        I7["Pincode"]
        I8["Preferred Car Model"]
    end

    subgraph CRE_DASH["🖥️ CRE Dashboard Features"]
        CD1["Customer Information Panel"]
        CD2["Interactive Map with<br/>Location Pinning"]
        CD3["Test Driver Assignment<br/>Module"]
        CD4["Car Model Display<br/>(Bottom Section)"]
        CD5["Live Driver<br/>Tracking View"]
    end

    subgraph DRIVER_APP["📱 Test Driver App Features"]
        DA1["GPS Location Tracking"]
        DA2["Customer Details View"]
        DA3["Navigation to<br/>Pin Location"]
        DA4["Assignment Notifications"]
        DA5["Car Model Info"]
    end

    INPUT --> CD1
    CD1 --> CD2
    CD2 --> CD3
    CD3 --> CD4
    CD4 --> DRIVER_APP
    DA1 -.->|"Live Location"| CD5

    style INPUT fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style CRE_DASH fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style DRIVER_APP fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

---

## Location Sharing Workflow

```mermaid
sequenceDiagram
    participant C as 👤 Customer
    participant CRE as 🖥️ CRE Dashboard
    participant TD as 📱 Test Driver App
    
    C->>CRE: Submits address details
    CRE->>CRE: Converts address to GPS coordinates
    CRE->>CRE: Pinpoints exact location on map
    CRE->>TD: Shares pinpoint location
    TD->>TD: Receives exact GPS coordinates
    TD->>TD: Opens navigation to customer
    
    loop Real-time Tracking
        TD->>CRE: Sends GPS location updates
        CRE->>CRE: Updates driver position on map
    end
    
    TD->>C: Arrives at customer location
```

---

## System Components Summary

| Component | Platform | Key Features |
|-----------|----------|--------------|
| **Customer** | Web/Phone | Provides personal details, address, and car model preference |
| **CRE Dashboard** | Web Application | Views all customer info, pinpoints location, assigns drivers, displays car model |
| **Test Driver App** | Android Mobile | GPS tracking, receives assignments, navigation to exact location |

---

## Data Flow Summary

```mermaid
flowchart TD
    A["🏠 Customer Address<br/>(Door No., Street, Area)"] --> B["📍 Exact GPS Coordinates"]
    B --> C["🖥️ CRE Pins Location<br/>on Dashboard Map"]
    C --> D["📤 Location Shared<br/>with Test Driver"]
    D --> E["📱 Driver App Shows<br/>Pinpoint Location"]
    E --> F["🚗 Driver Navigates<br/>to Customer"]
    F --> G["📡 Real-time GPS<br/>Tracking Active"]
    G -.-> C

    style A fill:#c8e6c9,stroke:#388e3c
    style B fill:#bbdefb,stroke:#1976d2
    style C fill:#b3e5fc,stroke:#0288d1
    style D fill:#ffe0b2,stroke:#f57c00
    style E fill:#ffccbc,stroke:#e64a19
    style F fill:#d1c4e9,stroke:#512da8
    style G fill:#f0f4c3,stroke:#afb42b
```

---

## Key Points

> [!IMPORTANT]
> - **Exact Location**: Customer's precise address is converted to GPS coordinates for accurate pinpointing
> - **Real-time Tracking**: Test driver's location is continuously tracked and visible on CRE dashboard
> - **Car Model Display**: The requested car model is prominently displayed at the bottom of the CRE dashboard
> - **Seamless Assignment**: CRE can assign test drivers with all customer details in one action
