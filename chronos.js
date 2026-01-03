
        // Theme Randomizer
        document.body.className = 'theme-' + (Math.floor(Math.random() * 3) + 1);

        // State
        let posts = JSON.parse(localStorage.getItem('chronos_posts') || '[]');
        let logs = JSON.parse(localStorage.getItem('chronos_logs') || '[]');

        // Auth
        function signup() {
            const id = document.getElementById('user-id').value;
            const pass = document.getElementById('user-pass').value;
            if(!id || !pass) return alert("EMPTY DATA");
            localStorage.setItem('agent_'+id, pass);
            alert("AGENT ENLISTED");
        }

        function login() {
            const id = document.getElementById('user-id').value;
            const pass = document.getElementById('user-pass').value;
            if(localStorage.getItem('agent_'+id) === pass) {
                document.getElementById('auth-overlay').style.display = 'none';
                addLog("ACCESS GRANTED: " + id);
            } else {
                alert("ACCESS DENIED");
            }
        }

        // Navigation
        function navTo(pageId, el) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.getElementById('page-' + pageId).classList.add('active');
            el.classList.add('active');
            if(pageId === 'intel') renderIntel();
            if(pageId === 'archive') renderArchive();
        }

        // Logic
        async function deployIntel() {
            const title = document.getElementById('post-title').value;
            const body = document.getElementById('post-body').value;
            const fileInput = document.getElementById('post-file');
            let media = null;

            if(fileInput.files[0]) {
                const file = fileInput.files[0];
                media = {
                    name: file.name,
                    type: file.type,
                    data: await toBase64(file)
                };
            }

            const newPost = { id: Date.now(), title, body, media, date: new Date().toLocaleString() };
            posts.unshift(newPost);
            localStorage.setItem('chronos_posts', JSON.stringify(posts));
            addLog("DEPLOYED: " + title);
            
            document.getElementById('post-title').value = '';
            document.getElementById('post-body').value = '';
            alert("INTEL SENT");
            navTo('intel', document.querySelectorAll('.nav-item')[1]);
        }

        function renderIntel() {
            const list = document.getElementById('intel-list');
            list.innerHTML = posts.map(p => `
                <div class="card">
                    <small>${p.date}</small>
                    <h3 style="color:var(--accent)">${p.title}</h3>
                    <p style="margin:10px 0">${p.body}</p>
                    ${p.media ? renderMedia(p.media) : ''}
                    <button onclick="deletePost(${p.id})" style="border:none; color:red; font-size:0.6rem; width:auto; padding:0">ERASE</button>
                </div>
            `).join('');
        }

        function renderArchive() {
            const list = document.getElementById('archive-list');
            const mediaOnly = posts.filter(p => p.media);
            list.innerHTML = mediaOnly.map(p => `
                <div class="card" style="text-align:center">
                    ${renderMedia(p.media)}
                    <p style="font-size:0.3rem; margin-top:5px;">${p.media.name}</p>
                    <a href="${p.media.data}" download="${p.media.name}" style="text-decoration:none">
                        <button style="height:30px; padding:0; font-size:0.6rem; margin-top:5px;">DOWNLOAD</button>
                    </a>
                </div>
            `).join('');
        }

        function renderMedia(m) {
            if(m.type.startsWith('image')) return `<img src="${m.data}" class="media-prev">`;
            if(m.type.startsWith('video')) return `<video src="${m.data}" controls class="media-prev"></video>`;
            if(m.type.startsWith('audio')) return `<audio src="${m.data}" controls style="width:100%; margin-top:10px;"></audio>`;
            return `<div class="card">FILE: ${m.type}</div>`;
        }

        function deletePost(id) {
            posts = posts.filter(p => p.id !== id);
            localStorage.setItem('chronos_posts', JSON.stringify(posts));
            addLog("ERASED RECORD: " + id);
            renderIntel();
        }

        function addLog(msg) {
            const time = new Date().toLocaleTimeString();
            logs.unshift(`[${time}] ${msg}`);
            localStorage.setItem('chronos_logs', JSON.stringify(logs.slice(0, 20)));
            updateLogDisplay();
        }

        function updateLogDisplay() {
            document.getElementById('log-box').innerHTML = logs.map(l => `<div>${l}</div>`).join('');
        }

        // Utils
        const toBase64 = file => new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
        });

        function clearStorage() {
            if(confirm("WIPE ALL SYSTEM DATA?")) {
                localStorage.clear();
                location.reload();
            }
        }

        // Clock & Location
        setInterval(() => {
            document.getElementById('clock').innerText = new Date().toLocaleTimeString();
        }, 1000);
        document.getElementById('date').innerText = new Date().toDateString().toUpperCase();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(p => {
                document.getElementById('location').innerText = `LAT: ${p.coords.latitude.toFixed(4)} / LONG: ${p.coords.longitude.toFixed(4)}`;
            });
        }

        updateLogDisplay();
    