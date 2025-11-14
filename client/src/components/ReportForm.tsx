
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Upload, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DraggableMarkerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

function DraggableMarker({ position, onPositionChange }: DraggableMarkerProps) {
  const [draggable, setDraggable] = useState(true);
  const [markerPos, setMarkerPos] = useState<[number, number]>(position);

  // Raipur city bounds
  const RAIPUR_BOUNDS = {
    minLat: 21.15,
    maxLat: 21.35,
    minLng: 81.55,
    maxLng: 81.75,
  };

  const isWithinRaipur = (lat: number, lng: number) => {
    return (
      lat >= RAIPUR_BOUNDS.minLat &&
      lat <= RAIPUR_BOUNDS.maxLat &&
      lng >= RAIPUR_BOUNDS.minLng &&
      lng <= RAIPUR_BOUNDS.maxLng
    );
  };

  useMapEvents({
    click(e) {
      if (!isWithinRaipur(e.latlng.lat, e.latlng.lng)) {
        alert("Please select a location within Raipur city limits.");
        return;
      }
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setMarkerPos(newPos);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={markerPos}
      draggable={draggable}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          
          if (!isWithinRaipur(position.lat, position.lng)) {
            alert("Please select a location within Raipur city limits.");
            setMarkerPos(markerPos); // Reset to previous position
            return;
          }
          
          setMarkerPos([position.lat, position.lng]);
          onPositionChange(position.lat, position.lng);
        },
      }}
    />
  );
}

interface ReportFormProps {
  onSubmit: (report: any) => void;
}

export function ReportForm({ onSubmit }: ReportFormProps) {
  const [formData, setFormData] = useState({
    type: "Water Leak",
    location: "",
    lat: 21.25,
    lng: 81.63,
    description: "",
    contact: "",
    photo: null as File | null,
  });
  const [searchAddress, setSearchAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Raipur city bounds (approximate)
  const RAIPUR_BOUNDS = {
    minLat: 21.15,
    maxLat: 21.35,
    minLng: 81.55,
    maxLng: 81.75,
  };

  const isWithinRaipur = (lat: number, lng: number) => {
    return (
      lat >= RAIPUR_BOUNDS.minLat &&
      lat <= RAIPUR_BOUNDS.maxLat &&
      lng >= RAIPUR_BOUNDS.minLng &&
      lng <= RAIPUR_BOUNDS.maxLng
    );
  };

  const handleAddressSearch = async (query: string) => {
    setSearchAddress(query);
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      // Adding viewbox parameter to prioritize Raipur area
      const viewbox = `${RAIPUR_BOUNDS.minLng},${RAIPUR_BOUNDS.maxLat},${RAIPUR_BOUNDS.maxLng},${RAIPUR_BOUNDS.minLat}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Raipur, Chhattisgarh')}&limit=10&viewbox=${viewbox}&bounded=1`
      );
      const data = await response.json();
      
      // Filter results to only include locations within Raipur bounds
      const raipurResults = data.filter((result: any) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        return isWithinRaipur(lat, lng);
      });
      
      setAddressSuggestions(raipurResults);
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddressSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAddress = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    if (!isWithinRaipur(lat, lng)) {
      alert("Please select a location within Raipur city limits.");
      return;
    }
    
    setFormData({
      ...formData,
      location: suggestion.display_name,
      lat,
      lng,
    });
    setSearchAddress(suggestion.display_name);
    setAddressSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      timestamp: new Date(),
      status: "pending",
      geoLocation: { lat: formData.lat, lng: formData.lng },
    });
    // Reset form
    setFormData({
      type: "Water Leak",
      location: "",
      lat: 21.25,
      lng: 81.63,
      description: "",
      contact: "",
      photo: null,
    });
    setSearchAddress("");
  };

  return (
    <Card className="p-6" data-testid="card-report-form">
      <h3 className="text-lg font-semibold mb-4">Report Water Issue</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Help us maintain equitable water distribution by reporting issues in your area
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Issue Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Water Leak">Water Leak</SelectItem>
              <SelectItem value="No Water Supply">No Water Supply</SelectItem>
              <SelectItem value="Low Pressure">Low Pressure</SelectItem>
              <SelectItem value="Irregular Supply">Irregular Supply</SelectItem>
              <SelectItem value="Poor Quality">Poor Quality</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="search-location" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Location
          </Label>
          <div className="relative">
            <Input
              id="search-location"
              value={searchAddress}
              onChange={(e) => handleAddressSearch(e.target.value)}
              placeholder="Type your address or area name..."
              className="mt-1"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {addressSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectAddress(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors text-sm"
                  >
                    {suggestion.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Confirm Location on Map (Click or drag marker)
          </Label>
          <div className="h-[300px] rounded-lg overflow-hidden border-2 border-border mt-2">
            <MapContainer
              center={[formData.lat, formData.lng]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              key={`${formData.lat}-${formData.lng}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker
                position={[formData.lat, formData.lng]}
                onPositionChange={(lat, lng) => {
                  setFormData({ ...formData, lat, lng });
                }}
              />
            </MapContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="lat" className="text-xs text-muted-foreground">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 21.25 })}
                className="mt-1 h-9 text-sm"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="lng" className="text-xs text-muted-foreground">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 81.63 })}
                className="mt-1 h-9 text-sm"
                readOnly
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location Details</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Gandhi Nagar, Block A"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide details about the issue..."
            required
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="contact">Contact Number</Label>
          <Input
            id="contact"
            type="tel"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            placeholder="Your phone number"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="photo" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Photo Evidence (Optional)
          </Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full">
          Submit Report
        </Button>
      </form>
    </Card>
  );
}
