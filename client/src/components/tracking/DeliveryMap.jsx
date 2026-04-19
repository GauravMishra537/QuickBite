import { useEffect, useRef, useState, useCallback } from 'react';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

/* Load Google Maps API via script tag (reliable, no deprecated Loader class) */
const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.google.maps));
            existingScript.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error('Google Maps script failed'));
        document.head.appendChild(script);
    });
};

/* Simulated delivery route from shop → customer */
const simulateRoute = (start, end, steps = 30) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        pts.push({
            lat: start.lat + (end.lat - start.lat) * t + (Math.random() - 0.5) * 0.002,
            lng: start.lng + (end.lng - start.lng) * t + (Math.random() - 0.5) * 0.002,
        });
    }
    return pts;
};

const DeliveryMap = ({ orderStatus, shopLocation, customerLocation, deliveryLocation }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRefs = useRef({});
    const polylineRef = useRef(null);
    const animRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [mapError, setMapError] = useState(false);

    const shop = shopLocation || { lat: 26.8467, lng: 80.9462 };
    const customer = customerLocation || { lat: 26.8567, lng: 80.9562 };

    const initMap = useCallback(async () => {
        try {
            const maps = await loadGoogleMaps();
            const center = { lat: (shop.lat + customer.lat) / 2, lng: (shop.lng + customer.lng) / 2 };

            const map = new maps.Map(mapRef.current, {
                center, zoom: 14,
                disableDefaultUI: false, zoomControl: true,
                streetViewControl: false, mapTypeControl: false,
            });
            mapInstance.current = map;

            // Shop marker (orange)
            markerRefs.current.shop = new maps.Marker({
                map, position: shop, title: 'Shop / Restaurant',
                icon: { path: maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#FF6B35', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
            });

            // Customer marker (green)
            markerRefs.current.customer = new maps.Marker({
                map, position: customer, title: 'Your Location',
                icon: { path: maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#2ecc71', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
            });

            // Info windows
            const shopInfo = new maps.InfoWindow({ content: '<div style="font-weight:600;padding:4px">🏪 Shop / Restaurant</div>' });
            const custInfo = new maps.InfoWindow({ content: '<div style="font-weight:600;padding:4px">🏠 Your Location</div>' });
            markerRefs.current.shop.addListener('click', () => shopInfo.open(map, markerRefs.current.shop));
            markerRefs.current.customer.addListener('click', () => custInfo.open(map, markerRefs.current.customer));

            // Dashed line between shop and customer
            new maps.Polyline({
                path: [shop, customer], geodesic: true, strokeColor: '#ffffff', strokeOpacity: 0,
                strokeWeight: 0, map,
                icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.4, strokeColor: '#ffffff', scale: 3 }, offset: '0', repeat: '15px' }],
            });

            setMapLoaded(true);
        } catch (err) {
            console.error('Maps error:', err);
            setMapError(true);
        }
    }, [shop.lat, shop.lng, customer.lat, customer.lng]);

    useEffect(() => {
        initMap();
        return () => { if (animRef.current) clearInterval(animRef.current); };
    }, [initMap]);

    // Animate delivery when out for delivery
    useEffect(() => {
        if (!mapLoaded || !mapInstance.current || !window.google) return;
        if (orderStatus !== 'outForDelivery') return;

        const maps = window.google.maps;
        const route = simulateRoute(shop, customer);

        markerRefs.current.delivery = new maps.Marker({
            map: mapInstance.current, position: route[0], title: 'Delivery Partner',
            icon: { path: maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, fillColor: '#e74c3c', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, rotation: 45 },
            zIndex: 10,
        });

        polylineRef.current = new maps.Polyline({
            path: [route[0]], geodesic: true, strokeColor: '#FF6B35', strokeOpacity: 0.9, strokeWeight: 4, map: mapInstance.current,
        });

        let step = 0;
        animRef.current = setInterval(() => {
            step++;
            if (step >= route.length) { clearInterval(animRef.current); return; }
            setCurrentStep(step);
            markerRefs.current.delivery?.setPosition(route[step]);
            polylineRef.current?.getPath().push(new maps.LatLng(route[step].lat, route[step].lng));
            mapInstance.current.panTo(route[step]);
        }, 2000);

        return () => { if (animRef.current) clearInterval(animRef.current); };
    }, [mapLoaded, orderStatus]);

    // Live location from socket
    useEffect(() => {
        if (!mapLoaded || !deliveryLocation || !markerRefs.current.delivery) return;
        markerRefs.current.delivery.setPosition(deliveryLocation);
        mapInstance.current?.panTo(deliveryLocation);
    }, [deliveryLocation, mapLoaded]);

    const progress = orderStatus === 'outForDelivery' ? Math.min(Math.round((currentStep / 30) * 100), 100) : orderStatus === 'delivered' ? 100 : 0;

    if (mapError) {
        return (
            <div style={{ width: '100%', height: 400, borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: 12 }}>
                <span style={{ fontSize: '3rem' }}>🗺️</span>
                <p style={{ fontWeight: 600 }}>Map couldn't load</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Live tracking status is shown in the timeline →</p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div ref={mapRef} style={{ width: '100%', height: 400 }} />
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)', fontSize: '0.875rem' }}>
                {orderStatus === 'outForDelivery' ? (
                    <>🏍️ Delivery partner on the way — <strong>{Math.max(0, 30 - currentStep)} min</strong> away</>
                ) : orderStatus === 'delivered' ? (
                    <>✅ Delivered!</>
                ) : (
                    <>📍 Live tracking starts once order is picked up</>
                )}
            </div>
            {orderStatus === 'outForDelivery' && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'var(--border-color)' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.5s ease' }} />
                </div>
            )}
        </div>
    );
};

export default DeliveryMap;
