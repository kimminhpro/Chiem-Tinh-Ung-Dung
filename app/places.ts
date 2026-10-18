/**
 * Danh sách nơi sinh cho form lập lá số.
 * Tọa độ là trung tâm tỉnh/thành (mức tương đối, đủ cho Lagna ở độ chính xác
 * thành phố). Người dùng cần chính xác hơn có thể chọn "Tự nhập tọa độ".
 */
export type Birthplace = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

const VN = (
  id: string,
  name: string,
  latitude: number,
  longitude: number,
): Birthplace => ({ id, name, latitude, longitude, timeZone: "Asia/Ho_Chi_Minh" });

export const BIRTHPLACES: Birthplace[] = [
  VN("hanoi", "Hà Nội", 21.0285, 105.8542),
  VN("haiphong", "Hải Phòng", 20.8449, 106.6881),
  VN("hochiminh", "TP. Hồ Chí Minh", 10.8231, 106.6297),
  VN("cantho", "Cần Thơ", 10.0452, 105.7469),
  VN("danang", "Đà Nẵng", 16.0544, 108.2022),
  VN("hue", "Huế", 16.4637, 107.5909),
  VN("angiang", "An Giang", 10.386, 105.4355),
  VN("bacninh", "Bắc Ninh", 21.1861, 106.0763),
  VN("camau", "Cà Mau", 9.1769, 105.1524),
  VN("caobang", "Cao Bằng", 22.6667, 106.25),
  VN("daklak", "Đắk Lắk", 12.6667, 108.05),
  VN("dienbien", "Điện Biên", 21.3833, 103.0167),
  VN("dongnai", "Đồng Nai", 10.9574, 106.8427),
  VN("dongthap", "Đồng Tháp", 10.4694, 105.6331),
  VN("gialai", "Gia Lai", 13.9833, 108.0),
  VN("hatinh", "Hà Tĩnh", 18.3428, 105.9057),
  VN("hungyen", "Hưng Yên", 20.6464, 106.0511),
  VN("khanhhoa", "Khánh Hòa", 12.2388, 109.1967),
  VN("laichau", "Lai Châu", 22.3864, 103.4703),
  VN("langson", "Lạng Sơn", 21.853, 106.7615),
  VN("laocai", "Lào Cai", 22.4809, 103.975),
  VN("lamdong", "Lâm Đồng", 11.9404, 108.4583),
  VN("nghean", "Nghệ An", 18.6796, 105.6813),
  VN("ninhbinh", "Ninh Bình", 20.2506, 105.9745),
  VN("phutho", "Phú Thọ", 21.3087, 105.4258),
  VN("quangngai", "Quảng Ngãi", 15.1214, 108.8044),
  VN("quangninh", "Quảng Ninh", 20.9101, 107.1839),
  VN("quangtri", "Quảng Trị", 16.8167, 107.1),
  VN("sonla", "Sơn La", 21.3279, 103.9144),
  VN("tayninh", "Tây Ninh", 11.3352, 106.1099),
  VN("thainguyen", "Thái Nguyên", 21.5671, 105.8252),
  VN("thanhhoa", "Thanh Hóa", 19.8067, 105.7852),
  VN("tuyenquang", "Tuyên Quang", 21.8236, 105.2194),
  VN("vinhlong", "Vĩnh Long", 10.2537, 105.9722),
  {
    id: "hekinan",
    name: "Hekinan, Nhật Bản",
    latitude: 34.8796,
    longitude: 136.9888,
    timeZone: "Asia/Tokyo",
  },
  {
    id: "tokyo",
    name: "Tokyo, Nhật Bản",
    latitude: 35.6762,
    longitude: 139.6503,
    timeZone: "Asia/Tokyo",
  },
];

export const CUSTOM_PLACE_ID = "custom";
