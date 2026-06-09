const fs = require('fs');
let content = fs.readFileSync('src/app/admin/sublocations/new/page.tsx', 'utf8');

const replacement = `            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Select City <span className="text-red-500!">*</span></label>
              <select
                required
                value={formData.city_id}
                onChange={(e) => setFormData({...formData, city_id: e.target.value})}
                className="w-full! px-4! py-2.5! bg-white! text-black! border-2! border-black! rounded-xl! text-base! focus:outline-none! transition-all! appearance-auto! min-h-[50px]! block! opacity-100! visible!"
                style={{ display: "block", visibility: "visible", width: "100%", height: "50px", border: "2px solid black", backgroundColor: "white", color: "black", opacity: 1, position: "relative", zIndex: 9999 }}
              >
                <option value="">-- Select a City --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city_name} {city.state_name ? '(' + city.state_name + ')' : ''}
                  </option>
                ))}
              </select>
            </div>`;

content = content.replace(/<div className="space-y-2!">[\s\S]*?<\/select>\n            <\/div>/, replacement);
fs.writeFileSync('src/app/admin/sublocations/new/page.tsx', content);
