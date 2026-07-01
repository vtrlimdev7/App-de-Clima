class WeatherForecast {
    constructor() {
        this.apiKey = 'ccbf82f7018c8c7740b1effc4c4c113e'; 
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

        // 1. Capturar os elementos do HTML
        this.cityInput = document.getElementById('cityInput');
        this.btnBuscar = document.getElementById('btnBuscar');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherResult = document.getElementById('weatherResult');

        // Elementos de mudança climática
        this.cityName = document.getElementById('cityName');
        this.temperature = document.getElementById('temperature');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.weatherDesc = document.getElementById('weatherDesc');
        this.humidity = document.getElementById('humidity');
        this.wind = document.getElementById('wind');
        this.historyList = document.getElementById('historyList');

        // 2. Buscar o histórico local
        this.history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        
        // 3. Inicializar os eventos e renderizar o histórico
        this.initEvents();
        this.renderHistory(); // Mantido comentado até criarmos a função
    }

    async getWeather(city) {
        const response = await fetch(`${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric&lang=pt_br`);
        if (!response.ok) {
            throw new Error('Cidade não encontrada');
        }
        return await response.json();
    }

    renderWeather(data) {
        // 1. Atualiza os textos principais com os dados da API
        this.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        this.weatherDesc.textContent = data.weather[0].description;
        this.humidity.textContent = `${data.main.humidity}%`;
        this.wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Converte m/s para km/h

        // 2. Atualiza o ícone do clima dinamicamente
        const iconCode = data.weather[0].icon;
        this.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // 3. Torna o bloco do resultado visível
        this.weatherResult.style.display = 'block';
    }

    initEvents() {
        this.btnBuscar.addEventListener('click', async () => {
            const cidade = this.cityInput.value.trim();

            if(!cidade) {
                this.showError('Por favor, digite o nome de uma cidade.');
                return;
            }

            try {
                this.errorMessage.style.display = 'none';
                
                // Busca os dados da API
                const dadosClima = await this.getWeather(cidade);
                
                // Renderiza na tela de verdade
                this.renderWeather(dadosClima);
                this.salvarHistorico(dadosClima.name);
                
            } catch (error) {
                this.showError(error.message);
            }
        });
    }

    showError(mensagem) {
        this.errorMessage.textContent = mensagem;
        this.errorMessage.style.display = 'block';
        this.weatherResult.style.display = 'none';
    }

    salvarHistorico(cidade) {
        // Evita duplicados: remove se já existir e joga para o topo da lista
        this.history = this.history.filter(item => item.toLowerCase() !== cidade.toLowerCase());
        this.history.unshift(cidade);

        // Limita o histórico a 5 cidades para não poluir a tela
        if(this.history.length > 5) this.history.pop();

        // Salva o LocalStorage do navegador
        localStorage.setItem('weatherHistory', JSON.stringify(this.history));

        // Atualiza a lista visual na tela
        this.renderHistory();
    }

    renderHistory() {
        // Limpa a lista antiga para não duplicar os elementos na tela
        this.historyList.innerHTML ='';

        // Cria um botão (li) para cada cidade salva
        this.history.forEach(cidade => {
            const li = document.createElement('li');
            li.textContent = cidade;
        
        // Se o usuário clicar na cidade do histórico, faz uma nova busca
        li.addEventListener('click', async () => {
            this.cityInput.value = cidade;
            this.errorMessage.style.display = 'none';
            try{
                const dadosClima = await this.getWeather(cidade);
                this.renderWeather(dadosClima);
                this.salvarHistorico(dadosClima.name);
            } catch (error) {
                this.showError(error.message);
            }
        });
        this.historyList.appendChild(li);
    });
}
}

new WeatherForecast();