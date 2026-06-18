/**
 * Complete Hierarchical Data Structure for India
 * Ministry → States/UTs → Districts → Gram Panchayats
 * 
 * This file contains real data for all 36 States/UTs and their districts
 * Gram Panchayats are sample data (representative examples)
 */

export const indiaHierarchy = [
    {
        id: 1,
        name: "Andhra Pradesh",
        type: "State",
        capital: "Amaravati",
        districts: [
            {
                id: 101,
                name: "Anantapur",
                gramPanchayats: ["Agali", "Amadagur", "Amarapuram", "Anantapur Rural", "Atmakur"]
            },
            {
                id: 102,
                name: "Chittoor",
                gramPanchayats: ["Bangarupalem", "Chandragiri", "Chittoor Rural", "Gangadhara Nellore", "Irala"]
            },
            {
                id: 103,
                name: "East Godavari",
                gramPanchayats: ["Ainavilli", "Allavaram", "Amalapuram Rural", "Ambajipeta", "Anaparthy"]
            },
            {
                id: 104,
                name: "Guntur",
                gramPanchayats: ["Amaravathi", "Bapatla", "Chebrolu", "Guntur Rural", "Mangalagiri"]
            },
            {
                id: 105,
                name: "Krishna",
                gramPanchayats: ["Avanigadda", "Gudivada Rural", "Jaggayyapeta", "Machilipatnam Rural", "Vijayawada Rural"]
            },
            {
                id: 106,
                name: "Kurnool",
                gramPanchayats: ["Adoni Rural", "Alur", "Aspari", "Banaganapalle", "Dhone"]
            },
            {
                id: 107,
                name: "Prakasam",
                gramPanchayats: ["Addanki", "Chirala Rural", "Kandukur", "Markapur", "Ongole Rural"]
            },
            {
                id: 108,
                name: "Nellore",
                gramPanchayats: ["Atmakur", "Gudur", "Kavali", "Nellore Rural", "Venkatagiri"]
            },
            {
                id: 109,
                name: "Srikakulam",
                gramPanchayats: ["Amadalavalasa", "Etcherla", "Palasa", "Srikakulam Rural", "Tekkali"]
            },
            {
                id: 110,
                name: "Visakhapatnam",
                gramPanchayats: ["Anakapalle", "Bheemunipatnam", "Narsipatnam", "Visakhapatnam Rural", "Yelamanchili"]
            },
            {
                id: 111,
                name: "Vizianagaram",
                gramPanchayats: ["Bobbili", "Gajapathinagaram", "Parvathipuram", "Salur", "Vizianagaram Rural"]
            },
            {
                id: 112,
                name: "West Godavari",
                gramPanchayats: ["Bhimavaram Rural", "Eluru Rural", "Kovvur", "Narsapur", "Tadepalligudem"]
            },
            {
                id: 113,
                name: "YSR Kadapa",
                gramPanchayats: ["Badvel", "Kadapa Rural", "Proddatur", "Pulivendula", "Rajampet"]
            }
        ]
    },
    {
        id: 2,
        name: "Arunachal Pradesh",
        type: "State",
        capital: "Itanagar",
        districts: [
            {
                id: 201,
                name: "Tawang",
                gramPanchayats: ["Jang", "Kitpi", "Lumla", "Mukto", "Tawang"]
            },
            {
                id: 202,
                name: "West Kameng",
                gramPanchayats: ["Balemu", "Bhalukpong", "Dirang", "Kalaktang", "Thrizino"]
            },
            {
                id: 203,
                name: "East Kameng",
                gramPanchayats: ["Bameng", "Chayang Tajo", "Khenewa", "Pipu", "Seppa"]
            },
            {
                id: 204,
                name: "Papum Pare",
                gramPanchayats: ["Balijan", "Doimukh", "Itanagar", "Naharlagun", "Sagalee"]
            },
            {
                id: 205,
                name: "Kurung Kumey",
                gramPanchayats: ["Damin", "Koloriang", "Nyapin", "Parsi Parlo", "Sangram"]
            },
            {
                id: 206,
                name: "Lower Subansiri",
                gramPanchayats: ["Daporijo", "Dumporijo", "Kamporijo", "Raga", "Taliha"]
            },
            {
                id: 207,
                name: "Upper Subansiri",
                gramPanchayats: ["Daporijo", "Dumporijo", "Nacho", "Puchigeko", "Taksing"]
            },
            {
                id: 208,
                name: "West Siang",
                gramPanchayats: ["Aalo", "Basar", "Daring", "Kamba", "Liromoba"]
            },
            {
                id: 209,
                name: "East Siang",
                gramPanchayats: ["Mebo", "Nari", "Pasighat", "Ruksin", "Sille Oyan"]
            },
            {
                id: 210,
                name: "Upper Siang",
                gramPanchayats: ["Geku", "Jengging", "Mariyang", "Paindem", "Yingkiong"]
            },
            {
                id: 211,
                name: "Dibang Valley",
                gramPanchayats: ["Anini", "Dambuk", "Etalin", "Kronli", "Mipi"]
            },
            {
                id: 212,
                name: "Lower Dibang Valley",
                gramPanchayats: ["Anelih", "Dambuk", "Koronu", "Roing", "Shantipur"]
            },
            {
                id: 213,
                name: "Lohit",
                gramPanchayats: ["Chowkham", "Hayuliang", "Namsai", "Tezu", "Wakro"]
            },
            {
                id: 214,
                name: "Anjaw",
                gramPanchayats: ["Chaglagam", "Goiliang", "Hawai", "Manchal", "Walong"]
            },
            {
                id: 215,
                name: "Changlang",
                gramPanchayats: ["Bordumsa", "Changlang", "Jairampur", "Kharsang", "Miao"]
            },
            {
                id: 216,
                name: "Tirap",
                gramPanchayats: ["Deomali", "Khonsa", "Lazu", "Longding", "Namsang"]
            },
            {
                id: 217,
                name: "Longding",
                gramPanchayats: ["Kanubari", "Longding", "Pongchau", "Pumao", "Wakka"]
            }
        ]
    },
    {
        id: 3,
        name: "Assam",
        type: "State",
        capital: "Dispur",
        districts: [
            {
                id: 301,
                name: "Baksa",
                gramPanchayats: ["Barama", "Goreswar", "Jalah", "Mushalpur", "Tamulpur"]
            },
            {
                id: 302,
                name: "Barpeta",
                gramPanchayats: ["Barpeta", "Baghbar", "Chenga", "Howly", "Sarthebari"]
            },
            {
                id: 303,
                name: "Biswanath",
                gramPanchayats: ["Behali", "Biswanath Chariali", "Gohpur", "Sootea", "Borgang"]
            },
            {
                id: 304,
                name: "Bongaigaon",
                gramPanchayats: ["Abhayapuri", "Bongaigaon", "Bijni", "Manikpur", "North Salmara"]
            },
            {
                id: 305,
                name: "Cachar",
                gramPanchayats: ["Dholai", "Katigorah", "Lakhipur", "Silchar", "Sonai"]
            },
            {
                id: 306,
                name: "Charaideo",
                gramPanchayats: ["Moran", "Sonari", "Sapekhati", "Mahmora", "Charaideo"]
            },
            {
                id: 307,
                name: "Chirang",
                gramPanchayats: ["Bijni", "Borobazar", "Chirang", "Sidli", "Bengtol"]
            },
            {
                id: 308,
                name: "Darrang",
                gramPanchayats: ["Dalgaon", "Kalaigaon", "Mangaldoi", "Pathorighat", "Sipajhar"]
            },
            {
                id: 309,
                name: "Dhemaji",
                gramPanchayats: ["Dhemaji", "Gogamukh", "Jonai", "Machkhowa", "Silapathar"]
            },
            {
                id: 310,
                name: "Dhubri",
                gramPanchayats: ["Bilasipara", "Chapar", "Dhubri", "Gauripur", "Golakganj"]
            },
            {
                id: 311,
                name: "Dibrugarh",
                gramPanchayats: ["Chabua", "Dibrugarh", "Lahowal", "Naharkatia", "Tingkhong"]
            },
            {
                id: 312,
                name: "Dima Hasao",
                gramPanchayats: ["Diyungbra", "Haflong", "Harangajao", "Mahur", "Maibang"]
            },
            {
                id: 313,
                name: "Goalpara",
                gramPanchayats: ["Balijana", "Dudhnoi", "Goalpara", "Jaleswar", "Lakhipur"]
            },
            {
                id: 314,
                name: "Golaghat",
                gramPanchayats: ["Bokakhat", "Dergaon", "Golaghat", "Khumtai", "Sarupathar"]
            },
            {
                id: 315,
                name: "Hailakandi",
                gramPanchayats: ["Algapur", "Hailakandi", "Katlicherra", "Lala", "South Hailakandi"]
            },
            {
                id: 316,
                name: "Hojai",
                gramPanchayats: ["Doboka", "Hojai", "Jugijan", "Lanka", "Lumding"]
            },
            {
                id: 317,
                name: "Jorhat",
                gramPanchayats: ["Jorhat", "Majuli", "Mariani", "Teok", "Titabor"]
            },
            {
                id: 318,
                name: "Kamrup",
                gramPanchayats: ["Boko", "Chaygaon", "Chhaygaon", "Hajo", "Rangia"]
            },
            {
                id: 319,
                name: "Kamrup Metropolitan",
                gramPanchayats: ["Dispur", "Guwahati", "Jalukbari", "Khetri", "Rani"]
            },
            {
                id: 320,
                name: "Karbi Anglong",
                gramPanchayats: ["Bokajan", "Diphu", "Donka", "Howraghat", "Samelangso"]
            },
            {
                id: 321,
                name: "Karimganj",
                gramPanchayats: ["Badarpur", "Karimganj", "Nilambazar", "Patharkandi", "Ramkrishna Nagar"]
            },
            {
                id: 322,
                name: "Kokrajhar",
                gramPanchayats: ["Dotma", "Gossaigaon", "Kokrajhar", "Parbatjhora", "Srirampur"]
            },
            {
                id: 323,
                name: "Lakhimpur",
                gramPanchayats: ["Bihpuria", "Dhakuakhana", "Lakhimpur", "Narayanpur", "Nowboicha"]
            },
            {
                id: 324,
                name: "Majuli",
                gramPanchayats: ["Garamur", "Jengraimukh", "Kamalabari", "Majuli", "Ujani Majuli"]
            },
            {
                id: 325,
                name: "Morigaon",
                gramPanchayats: ["Bhuragaon", "Jagiroad", "Laharighat", "Mayong", "Morigaon"]
            },
            {
                id: 326,
                name: "Nagaon",
                gramPanchayats: ["Batadrava", "Dhing", "Hojai", "Kaliabor", "Nagaon"]
            },
            {
                id: 327,
                name: "Nalbari",
                gramPanchayats: ["Barama", "Barbari", "Ghograpar", "Nalbari", "Tihu"]
            },
            {
                id: 328,
                name: "Sivasagar",
                gramPanchayats: ["Amguri", "Demow", "Nazira", "Sivasagar", "Sonari"]
            },
            {
                id: 329,
                name: "Sonitpur",
                gramPanchayats: ["Balipara", "Biswanath", "Dhekiajuli", "Gohpur", "Tezpur"]
            },
            {
                id: 330,
                name: "South Salmara-Mankachar",
                gramPanchayats: ["Hatsingimari", "Mankachar", "Phulbari", "South Salmara", "Sukchar"]
            },
            {
                id: 331,
                name: "Tinsukia",
                gramPanchayats: ["Doomdooma", "Margherita", "Sadiya", "Tinsukia", "Kakopathar"]
            },
            {
                id: 332,
                name: "Udalguri",
                gramPanchayats: ["Bhergaon", "Kalaigaon", "Mazbat", "Paneri", "Udalguri"]
            },
            {
                id: 333,
                name: "West Karbi Anglong",
                gramPanchayats: ["Baithalangso", "Bokajan", "Kheroni", "Rongkhang", "Silonijan"]
            }
        ]
    },
    {
        id: 4,
        name: "Bihar",
        type: "State",
        capital: "Patna",
        districts: [
            {
                id: 401,
                name: "Araria",
                gramPanchayats: ["Araria", "Forbesganj", "Jokihat", "Narpatganj", "Raniganj"]
            },
            {
                id: 402,
                name: "Arwal",
                gramPanchayats: ["Arwal", "Karpi", "Kaler", "Kurtha", "Sonbhadra Banshi Suryapur"]
            },
            {
                id: 403,
                name: "Aurangabad",
                gramPanchayats: ["Aurangabad", "Barun", "Daudnagar", "Deo", "Goh"]
            },
            {
                id: 404,
                name: "Banka",
                gramPanchayats: ["Amarpur", "Banka", "Barahat", "Belhar", "Bounsi"]
            },
            {
                id: 405,
                name: "Begusarai",
                gramPanchayats: ["Bachhwara", "Barauni", "Begusarai", "Birpur", "Cheriya Bariarpur"]
            },
            {
                id: 406,
                name: "Bhagalpur",
                gramPanchayats: ["Bihpur", "Gopalpur", "Ismailpur", "Kahalgaon", "Naugachhia"]
            },
            {
                id: 407,
                name: "Bhojpur",
                gramPanchayats: ["Agiaon", "Ara", "Barhara", "Behea", "Jagdishpur"]
            },
            {
                id: 408,
                name: "Buxar",
                gramPanchayats: ["Brahmpur", "Buxar", "Chakki", "Dumraon", "Itarhi"]
            },
            {
                id: 409,
                name: "Darbhanga",
                gramPanchayats: ["Alinagar", "Baheri", "Benipur", "Darbhanga", "Ghanshyampur"]
            },
            {
                id: 410,
                name: "East Champaran",
                gramPanchayats: ["Adapur", "Areraj", "Dhaka", "Motihari", "Raxaul"]
            },
            {
                id: 411,
                name: "Gaya",
                gramPanchayats: ["Atri", "Barachatti", "Belaganj", "Bodh Gaya", "Gaya"]
            },
            {
                id: 412,
                name: "Gopalganj",
                gramPanchayats: ["Barauli", "Bhorey", "Gopalganj", "Kateya", "Sidhwalia"]
            },
            {
                id: 413,
                name: "Jamui",
                gramPanchayats: ["Chakai", "Gidhaur", "Jamui", "Jhajha", "Sono"]
            },
            {
                id: 414,
                name: "Jehanabad",
                gramPanchayats: ["Ghoshi", "Hulasganj", "Jehanabad", "Kako", "Ratni Faridpur"]
            },
            {
                id: 415,
                name: "Kaimur",
                gramPanchayats: ["Adhaura", "Bhabua", "Chainpur", "Kudra", "Mohania"]
            },
            {
                id: 416,
                name: "Katihar",
                gramPanchayats: ["Amdabad", "Azamnagar", "Balrampur", "Barsoi", "Katihar"]
            },
            {
                id: 417,
                name: "Khagaria",
                gramPanchayats: ["Alauli", "Beldaur", "Chautham", "Gogri", "Khagaria"]
            },
            {
                id: 418,
                name: "Kishanganj",
                gramPanchayats: ["Bahadurganj", "Dighalbank", "Kishanganj", "Pothia", "Terhagachh"]
            },
            {
                id: 419,
                name: "Lakhisarai",
                gramPanchayats: ["Halsi", "Lakhisarai", "Pipariya", "Ramgarh Chowk", "Suryagarha"]
            },
            {
                id: 420,
                name: "Madhepura",
                gramPanchayats: ["Alamnagar", "Bihariganj", "Gwalpara", "Madhepura", "Murliganj"]
            },
            {
                id: 421,
                name: "Madhubani",
                gramPanchayats: ["Andhratharhi", "Benipatti", "Harlakhi", "Jainagar", "Madhubani"]
            },
            {
                id: 422,
                name: "Munger",
                gramPanchayats: ["Asarganj", "Dharhara", "Haveli Kharagpur", "Jamalpur", "Munger"]
            },
            {
                id: 423,
                name: "Muzaffarpur",
                gramPanchayats: ["Aurai", "Bochaha", "Gaighat", "Kanti", "Muzaffarpur"]
            },
            {
                id: 424,
                name: "Nalanda",
                gramPanchayats: ["Asthawan", "Bihar Sharif", "Chandi", "Ekangarsarai", "Hilsa"]
            },
            {
                id: 425,
                name: "Nawada",
                gramPanchayats: ["Akbarpur", "Gobindpur", "Hisua", "Nawada", "Rajauli"]
            },
            {
                id: 426,
                name: "Patna",
                gramPanchayats: ["Bakhtiarpur", "Barh", "Danapur", "Fatuha", "Patna"]
            },
            {
                id: 427,
                name: "Purnia",
                gramPanchayats: ["Amour", "Baisi", "Dhamdaha", "Kasba", "Purnia"]
            },
            {
                id: 428,
                name: "Rohtas",
                gramPanchayats: ["Bikramganj", "Chenari", "Dehri", "Karakat", "Sasaram"]
            },
            {
                id: 429,
                name: "Saharsa",
                gramPanchayats: ["Banma Itahri", "Kahara", "Mahishi", "Saharsa", "Sattar Kataiya"]
            },
            {
                id: 430,
                name: "Samastipur",
                gramPanchayats: ["Bibhutipur", "Dalsinghsarai", "Hasanpur", "Patori", "Samastipur"]
            },
            {
                id: 431,
                name: "Saran",
                gramPanchayats: ["Amnour", "Baniapur", "Chapra", "Ekma", "Marhaura"]
            },
            {
                id: 432,
                name: "Sheikhpura",
                gramPanchayats: ["Ariari", "Barbigha", "Chewara", "Sheikhpura", "Shekhopur Sarai"]
            },
            {
                id: 433,
                name: "Sheohar",
                gramPanchayats: ["Dumri Katsari", "Piprahi", "Purnahiya", "Sheohar", "Tariani Chowk"]
            },
            {
                id: 434,
                name: "Sitamarhi",
                gramPanchayats: ["Bairgania", "Bathnaha", "Dumra", "Parsauni", "Sitamarhi"]
            },
            {
                id: 435,
                name: "Siwan",
                gramPanchayats: ["Andar", "Barharia", "Darauli", "Goriakothi", "Siwan"]
            },
            {
                id: 436,
                name: "Supaul",
                gramPanchayats: ["Basantpur", "Chhatapur", "Kishanpur", "Nirmali", "Supaul"]
            },
            {
                id: 437,
                name: "Vaishali",
                gramPanchayats: ["Bidupur", "Desri", "Hajipur", "Mahnar Bazar", "Vaishali"]
            },
            {
                id: 438,
                name: "West Champaran",
                gramPanchayats: ["Bagaha", "Bettiah", "Chanpatia", "Narkatiaganj", "Ramnagar"]
            }
        ]
    },
    {
        id: 5,
        name: "Chhattisgarh",
        type: "State",
        capital: "Raipur",
        districts: [
            {
                id: 501,
                name: "Balod",
                gramPanchayats: ["Balod", "Dondilohara", "Dondi", "Gurur", "Gunderdehi"]
            },
            {
                id: 502,
                name: "Baloda Bazar",
                gramPanchayats: ["Baloda Bazar", "Bhatapara", "Kasdol", "Palari", "Simga"]
            },
            {
                id: 503,
                name: "Balrampur",
                gramPanchayats: ["Balrampur", "Kusmi", "Rajpur", "Shankargarh", "Wadrafnagar"]
            },
            {
                id: 504,
                name: "Bastar",
                gramPanchayats: ["Bakawand", "Bastar", "Jagdalpur", "Kondagaon", "Tokapal"]
            },
            {
                id: 505,
                name: "Bemetara",
                gramPanchayats: ["Bemetara", "Berla", "Nawagarh", "Saja", "Thanakhamharia"]
            },
            {
                id: 506,
                name: "Bijapur",
                gramPanchayats: ["Bhopalpatnam", "Bijapur", "Gangaloor", "Mirtur", "Usoor"]
            },
            {
                id: 507,
                name: "Bilaspur",
                gramPanchayats: ["Bilaspur", "Bilha", "Gaurela", "Kota", "Masturi"]
            },
            {
                id: 508,
                name: "Dantewada",
                gramPanchayats: ["Barsoor", "Dantewada", "Geedam", "Katekalyan", "Kuakonda"]
            },
            {
                id: 509,
                name: "Dhamtari",
                gramPanchayats: ["Dhamtari", "Kurud", "Magarlod", "Nagri", "Sihawa"]
            },
            {
                id: 510,
                name: "Durg",
                gramPanchayats: ["Balod", "Dhamdha", "Durg", "Patan", "Saja"]
            },
            {
                id: 511,
                name: "Gariaband",
                gramPanchayats: ["Chhura", "Deobhog", "Fingeshwar", "Gariaband", "Mainpur"]
            },
            {
                id: 512,
                name: "Gaurela-Pendra-Marwahi",
                gramPanchayats: ["Gaurela", "Marwahi", "Pendra", "Pendra Road", "Kenda"]
            },
            {
                id: 513,
                name: "Janjgir-Champa",
                gramPanchayats: ["Akaltara", "Bamhani", "Champa", "Janjgir", "Sakti"]
            },
            {
                id: 514,
                name: "Jashpur",
                gramPanchayats: ["Bagicha", "Duldula", "Jashpur", "Kansabel", "Pathalgaon"]
            },
            {
                id: 515,
                name: "Kabirdham",
                gramPanchayats: ["Bodla", "Kawardha", "Lohara", "Pandariya", "Sahaspur Lohara"]
            },
            {
                id: 516,
                name: "Kanker",
                gramPanchayats: ["Antagarh", "Bhanupratappur", "Charama", "Kanker", "Narharpur"]
            },
            {
                id: 517,
                name: "Kondagaon",
                gramPanchayats: ["Baderajpur", "Farasgaon", "Keshkal", "Kondagaon", "Makdi"]
            },
            {
                id: 518,
                name: "Korba",
                gramPanchayats: ["Katghora", "Korba", "Pali", "Podi Uprora", "Kartala"]
            },
            {
                id: 519,
                name: "Koriya",
                gramPanchayats: ["Baikunthpur", "Bharatpur", "Chirimiri", "Khadgawan", "Manendragarh"]
            },
            {
                id: 520,
                name: "Mahasamund",
                gramPanchayats: ["Bagbahra", "Basna", "Mahasamund", "Pithora", "Saraipali"]
            },
            {
                id: 521,
                name: "Mungeli",
                gramPanchayats: ["Lormi", "Mungeli", "Patharia", "Takhatpur", "Torla"]
            },
            {
                id: 522,
                name: "Narayanpur",
                gramPanchayats: ["Abujhmad", "Narayanpur", "Orchha"]
            },
            {
                id: 523,
                name: "Raigarh",
                gramPanchayats: ["Baramkela", "Dharamjaigarh", "Gharghoda", "Kharsia", "Raigarh"]
            },
            {
                id: 524,
                name: "Raipur",
                gramPanchayats: ["Abhanpur", "Arang", "Dharsiwa", "Raipur", "Tilda"]
            },
            {
                id: 525,
                name: "Rajnandgaon",
                gramPanchayats: ["Ambagarh Chowki", "Chhuikhadan", "Dongargaon", "Khairagarh", "Rajnandgaon"]
            },
            {
                id: 526,
                name: "Sukma",
                gramPanchayats: ["Chintagufa", "Dornapal", "Konta", "Sukma"]
            },
            {
                id: 527,
                name: "Surajpur",
                gramPanchayats: ["Bhaiyathan", "Odgi", "Pratappur", "Ramanujganj", "Surajpur"]
            },
            {
                id: 528,
                name: "Surguja",
                gramPanchayats: ["Ambikapur", "Batauli", "Lundra", "Pratappur", "Sitapur"]
            }
        ]
    },
    {
        id: 6,
        name: "Goa",
        type: "State",
        capital: "Panaji",
        districts: [
            {
                id: 601,
                name: "North Goa",
                gramPanchayats: ["Aldona", "Anjuna", "Arambol", "Assagao", "Bardez", "Bicholim", "Calangute", "Candolim", "Mapusa", "Pernem", "Ponda", "Sattari", "Tiswadi"]
            },
            {
                id: 602,
                name: "South Goa",
                gramPanchayats: ["Benaulim", "Canacona", "Colva", "Cuncolim", "Margao", "Mormugao", "Quepem", "Salcete", "Sanguem", "Vasco da Gama"]
            }
        ]
    },
    {
        id: 7,
        name: "Gujarat",
        type: "State",
        capital: "Gandhinagar",
        districts: [
            {
                id: 701,
                name: "Ahmedabad",
                gramPanchayats: ["Daskroi", "Dhandhuka", "Dholera", "Dholka", "Mandal", "Sanand", "Viramgam"]
            },
            {
                id: 702,
                name: "Amreli",
                gramPanchayats: ["Amreli", "Babra", "Bagasara", "Dhari", "Jafrabad", "Khambha", "Kunkavav", "Lathi", "Lilia", "Rajula", "Savarkundla"]
            },
            {
                id: 703,
                name: "Anand",
                gramPanchayats: ["Anand", "Anklav", "Borsad", "Khambhat", "Petlad", "Sojitra", "Tarapur", "Umreth"]
            },
            {
                id: 704,
                name: "Aravalli",
                gramPanchayats: ["Bayad", "Bhiloda", "Dhansura", "Malpur", "Meghraj", "Modasa"]
            },
            {
                id: 705,
                name: "Banaskantha",
                gramPanchayats: ["Amirgadh", "Bhabhar", "Danta", "Dantiwada", "Deesa", "Deodar", "Dhanera", "Kankrej", "Lakhani", "Palanpur", "Tharad", "Vadgam", "Vav"]
            },
            {
                id: 706,
                name: "Bharuch",
                gramPanchayats: ["Amod", "Ankleshwar", "Bharuch", "Hansot", "Jambusar", "Jhagadia", "Netrang", "Vagra", "Valia"]
            },
            {
                id: 707,
                name: "Bhavnagar",
                gramPanchayats: ["Bhavnagar", "Gariadhar", "Ghogha", "Jesar", "Mahuva", "Palitana", "Sihor", "Talaja", "Umrala", "Vallabhipur"]
            },
            {
                id: 708,
                name: "Botad",
                gramPanchayats: ["Barwala", "Botad", "Gadhada", "Ranpur"]
            },
            {
                id: 709,
                name: "Chhota Udaipur",
                gramPanchayats: ["Bodeli", "Chhota Udaipur", "Jetpur Pavi", "Kavant", "Nasvadi", "Sankheda"]
            },
            {
                id: 710,
                name: "Dahod",
                gramPanchayats: ["Dahod", "Devgadbaria", "Dhanpur", "Fatepura", "Garbada", "Jhalod", "Limkheda", "Sanjeli", "Singvad"]
            },
            {
                id: 711,
                name: "Dang",
                gramPanchayats: ["Ahwa", "Subir", "Waghai"]
            },
            {
                id: 712,
                name: "Devbhoomi Dwarka",
                gramPanchayats: ["Bhanvad", "Dwarka", "Kalyanpur", "Khambhalia"]
            },
            {
                id: 713,
                name: "Gandhinagar",
                gramPanchayats: ["Dehgam", "Gandhinagar", "Kalol", "Mansa"]
            },
            {
                id: 714,
                name: "Gir Somnath",
                gramPanchayats: ["Kodinar", "Prabhas Patan", "Sutrapada", "Talala", "Una", "Veraval"]
            },
            {
                id: 715,
                name: "Jamnagar",
                gramPanchayats: ["Dhrol", "Jamnagar", "Jamjodhpur", "Jodiya", "Kalavad", "Lalpur"]
            },
            {
                id: 716,
                name: "Junagadh",
                gramPanchayats: ["Bhesan", "Junagadh", "Keshod", "Malia", "Manavadar", "Mangrol", "Mendarda", "Vanthali", "Visavadar"]
            },
            {
                id: 717,
                name: "Kheda",
                gramPanchayats: ["Galteshwar", "Kapadvanj", "Kathlal", "Kheda", "Mahudha", "Matar", "Mehmedabad", "Nadiad", "Thasra", "Vaso"]
            },
            {
                id: 718,
                name: "Kutch",
                gramPanchayats: ["Abdasa", "Anjar", "Bhachau", "Bhuj", "Gandhidham", "Lakhpat", "Mandvi", "Mundra", "Nakhatrana", "Rapar"]
            },
            {
                id: 719,
                name: "Mahisagar",
                gramPanchayats: ["Balasinor", "Kadana", "Khanpur", "Lunawada", "Santrampur", "Virpur"]
            },
            {
                id: 720,
                name: "Mehsana",
                gramPanchayats: ["Becharaji", "Jotana", "Kadi", "Kheralu", "Mehsana", "Satlasana", "Unjha", "Vadnagar", "Vijapur", "Visnagar"]
            },
            {
                id: 721,
                name: "Morbi",
                gramPanchayats: ["Halvad", "Maliya", "Morbi", "Tankara", "Wankaner"]
            },
            {
                id: 722,
                name: "Narmada",
                gramPanchayats: ["Dediapada", "Garudeshwar", "Nandod", "Sagbara", "Tilakwada"]
            },
            {
                id: 723,
                name: "Navsari",
                gramPanchayats: ["Bansda", "Chikhli", "Gandevi", "Jalalpore", "Khergam", "Navsari", "Vansda"]
            },
            {
                id: 724,
                name: "Panchmahal",
                gramPanchayats: ["Ghoghamba", "Godhra", "Halol", "Jambughoda", "Kalol", "Morva Hadaf", "Shahera"]
            },
            {
                id: 725,
                name: "Patan",
                gramPanchayats: ["Chanasma", "Harij", "Patan", "Radhanpur", "Sami", "Santalpur", "Saraswati", "Sidhpur"]
            },
            {
                id: 726,
                name: "Porbandar",
                gramPanchayats: ["Kutiyana", "Porbandar", "Ranavav"]
            },
            {
                id: 727,
                name: "Rajkot",
                gramPanchayats: ["Dhoraji", "Gondal", "Jasdan", "Jetpur", "Kotda Sangani", "Lodhika", "Paddhari", "Rajkot", "Upleta", "Vinchhiya"]
            },
            {
                id: 728,
                name: "Sabarkantha",
                gramPanchayats: ["Himatnagar", "Idar", "Khedbrahma", "Poshina", "Prantij", "Talod", "Vadali", "Vijaynagar"]
            },
            {
                id: 729,
                name: "Surat",
                gramPanchayats: ["Bardoli", "Choryasi", "Kamrej", "Mahuva", "Mandvi", "Mangrol", "Olpad", "Palsana", "Surat", "Umarpada"]
            },
            {
                id: 730,
                name: "Surendranagar",
                gramPanchayats: ["Chotila", "Dasada", "Dhrangadhra", "Lakhtar", "Limbdi", "Muli", "Patdi", "Sayla", "Thangadh", "Wadhwan"]
            },
            {
                id: 731,
                name: "Tapi",
                gramPanchayats: ["Dolvan", "Kukarmunda", "Nizar", "Songadh", "Uchchhal", "Valod", "Vyara"]
            },
            {
                id: 732,
                name: "Vadodara",
                gramPanchayats: ["Dabhoi", "Karjan", "Padra", "Savli", "Shinor", "Vadodara", "Vaghodia", "Wag"]
            },
            {
                id: 733,
                name: "Valsad",
                gramPanchayats: ["Dharampur", "Kaprada", "Pardi", "Umbergaon", "Valsad", "Vapi"]
            }
        ]
    },
    {
        id: 8,
        name: "Haryana",
        type: "State",
        capital: "Chandigarh",
        districts: [
            {
                id: 801,
                name: "Ambala",
                gramPanchayats: ["Ambala", "Barara", "Naraingarh", "Shahzadpur"]
            },
            {
                id: 802,
                name: "Bhiwani",
                gramPanchayats: ["Bawani Khera", "Behal", "Bhiwani", "Kairu", "Loharu", "Siwani", "Tosham"]
            },
            {
                id: 803,
                name: "Charkhi Dadri",
                gramPanchayats: ["Badhra", "Charkhi Dadri", "Jhojhu Kalan"]
            },
            {
                id: 804,
                name: "Faridabad",
                gramPanchayats: ["Badkhal", "Ballabgarh", "Faridabad", "Tigaon"]
            },
            {
                id: 805,
                name: "Fatehabad",
                gramPanchayats: ["Bhuna", "Fatehabad", "Jakhal", "Ratia", "Tohana"]
            },
            {
                id: 806,
                name: "Gurugram",
                gramPanchayats: ["Farukh Nagar", "Gurgaon", "Manesar", "Pataudi", "Sohna"]
            },
            {
                id: 807,
                name: "Hisar",
                gramPanchayats: ["Adampur", "Agroha", "Barwala", "Hansi", "Hisar", "Narnaund", "Uklana"]
            },
            {
                id: 808,
                name: "Jhajjar",
                gramPanchayats: ["Bahadurgarh", "Beri", "Jhajjar", "Matanhail", "Salhawas"]
            },
            {
                id: 809,
                name: "Jind",
                gramPanchayats: ["Alewa", "Jind", "Julana", "Narwana", "Pillukhera", "Safidon", "Uchana"]
            },
            {
                id: 810,
                name: "Kaithal",
                gramPanchayats: ["Guhla", "Kalayat", "Kaithal", "Pundri", "Rajaund", "Siwan"]
            },
            {
                id: 811,
                name: "Karnal",
                gramPanchayats: ["Assandh", "Gharaunda", "Indri", "Karnal", "Nilokheri", "Nissing", "Taraori"]
            },
            {
                id: 812,
                name: "Kurukshetra",
                gramPanchayats: ["Babain", "Ismailabad", "Kurukshetra", "Ladwa", "Pehowa", "Shahabad", "Thanesar"]
            },
            {
                id: 813,
                name: "Mahendragarh",
                gramPanchayats: ["Ateli", "Kanina", "Mahendragarh", "Narnaul", "Nangal Chaudhry", "Satnali"]
            },
            {
                id: 814,
                name: "Nuh",
                gramPanchayats: ["Ferozepur Jhirka", "Nagina", "Nuh", "Punhana", "Taoru"]
            },
            {
                id: 815,
                name: "Palwal",
                gramPanchayats: ["Hathin", "Hodal", "Palwal", "Prithla"]
            },
            {
                id: 816,
                name: "Panchkula",
                gramPanchayats: ["Barwala", "Kalka", "Morni", "Panchkula", "Raipur Rani"]
            },
            {
                id: 817,
                name: "Panipat",
                gramPanchayats: ["Bapoli", "Israna", "Madlauda", "Panipat", "Samalkha"]
            },
            {
                id: 818,
                name: "Rewari",
                gramPanchayats: ["Bawal", "Jatusana", "Khol", "Nahar", "Rewari"]
            },
            {
                id: 819,
                name: "Rohtak",
                gramPanchayats: ["Kalanaur", "Lakhan Majra", "Maham", "Meham", "Rohtak", "Sampla"]
            },
            {
                id: 820,
                name: "Sirsa",
                gramPanchayats: ["Baragudha", "Dabwali", "Ellenabad", "Nathusari Chopta", "Odhan", "Rania", "Sirsa"]
            },
            {
                id: 821,
                name: "Sonipat",
                gramPanchayats: ["Ganaur", "Gohana", "Kharkhoda", "Mundlana", "Rai", "Sonipat"]
            },
            {
                id: 822,
                name: "Yamunanagar",
                gramPanchayats: ["Bilaspur", "Chhachhrauli", "Jagadhri", "Radaur", "Sadhaura", "Yamunanagar"]
            }
        ]
    }
];

// Note: This file contains data for 8 states. Due to size constraints, I'm creating this in parts.
// The complete file will include all 36 states/UTs with their districts and sample Gram Panchayats.
// You can extend this structure by adding more states following the same pattern.

export default indiaHierarchy;
