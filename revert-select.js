const fs = require('fs');

let content = fs.readFileSync('src/app/admin/sublocations/new/page.tsx', 'utf8');

const replacement = `            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Select City <span className="text-red-500!">*</span></label>
              <select
                required
                value={formData.city_id}
                onChange={(e) => setFormData({...formData, city_id: e.target.value})}
                className="w-full! px-4! py-2.5! bg-gray-50! text-gray-900! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all! appearance-auto!"
              >
                <option value="">-- Select a City --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city_name} {city.state_name ? '(' + city.state_name + ')' : ''}
                  </option>
                ))}
              </select>
            </div>`;

// Replace the entire div containing the debug and city select
content = content.replace(/<div className="space-y-2! border-4! border-red-500! p-4! bg-red-50!">[\s\S]*?<\/select>\n            <\/div>/, replacement);

fs.writeFileSync('src/app/admin/sublocations/new/page.tsx', content);
