export interface Area {
  name: string;
  lat: number;
  lng: number;
}

export interface Region {
  name: string;
  areas: Area[];
}

export const REGIONS: Region[] = [
  {
    name: "서울",
    areas: [
      { name: "강남구", lat: 37.5172, lng: 127.0473 },
      { name: "강동구", lat: 37.5301, lng: 127.1238 },
      { name: "강북구", lat: 37.6396, lng: 127.0255 },
      { name: "강서구", lat: 37.5510, lng: 126.8495 },
      { name: "관악구", lat: 37.4784, lng: 126.9516 },
      { name: "광진구", lat: 37.5385, lng: 127.0823 },
      { name: "구로구", lat: 37.4955, lng: 126.8876 },
      { name: "금천구", lat: 37.4569, lng: 126.8955 },
      { name: "노원구", lat: 37.6543, lng: 127.0568 },
      { name: "도봉구", lat: 37.6688, lng: 127.0471 },
      { name: "동대문구", lat: 37.5744, lng: 127.0400 },
      { name: "동작구", lat: 37.5124, lng: 126.9393 },
      { name: "마포구", lat: 37.5664, lng: 126.9018 },
      { name: "서대문구", lat: 37.5791, lng: 126.9368 },
      { name: "서초구", lat: 37.4837, lng: 127.0324 },
      { name: "성동구", lat: 37.5634, lng: 127.0370 },
      { name: "성북구", lat: 37.5894, lng: 127.0167 },
      { name: "송파구", lat: 37.5146, lng: 127.1060 },
      { name: "양천구", lat: 37.5170, lng: 126.8665 },
      { name: "영등포구", lat: 37.5264, lng: 126.8963 },
      { name: "용산구", lat: 37.5326, lng: 126.9906 },
      { name: "은평구", lat: 37.6177, lng: 126.9227 },
      { name: "종로구", lat: 37.5735, lng: 126.9790 },
      { name: "중구", lat: 37.5641, lng: 126.9979 },
      { name: "중랑구", lat: 37.6066, lng: 127.0928 },
    ],
  },
  {
    name: "경기",
    areas: [
      { name: "성남시", lat: 37.4201, lng: 127.1265 },
      { name: "수원시", lat: 37.2636, lng: 127.0286 },
      { name: "용인시", lat: 37.2411, lng: 127.1776 },
      { name: "고양시", lat: 37.6584, lng: 126.8320 },
      { name: "부천시", lat: 37.5034, lng: 126.7660 },
      { name: "안양시", lat: 37.3943, lng: 126.9568 },
      { name: "화성시", lat: 37.1994, lng: 126.8313 },
      { name: "평택시", lat: 36.9921, lng: 127.1129 },
      { name: "의정부시", lat: 37.7381, lng: 127.0337 },
      { name: "파주시", lat: 37.7599, lng: 126.7800 },
    ],
  },
  {
    name: "부산",
    areas: [
      { name: "해운대구", lat: 35.1631, lng: 129.1635 },
      { name: "부산진구", lat: 35.1630, lng: 129.0532 },
      { name: "동래구", lat: 35.2049, lng: 129.0840 },
      { name: "남구", lat: 35.1365, lng: 129.0849 },
      { name: "수영구", lat: 35.1455, lng: 129.1133 },
    ],
  },
];

export function findArea(areaName: string): Area | undefined {
  for (const region of REGIONS) {
    const area = region.areas.find((a) => a.name === areaName);
    if (area) return area;
  }
  return undefined;
}
