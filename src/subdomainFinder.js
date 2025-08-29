const dns = require('dns');
const axios = require('axios');
const wordlist = require('wordlist');

class SubdomainFinder {
    constructor(domain) {
        this.domain = domain;
        this.discoveredSubdomains = new Set();
    }

    async findSubdomains() {
        const results = [];
        
        // 1. DNS Bruteforce
        await this.dnsBruteforce(results);
        
        // 2. Certificate Transparency Logs
        await this.certTransparencyLogs(results);
        
        // 3. Search Engine Discovery
        await this.searchEngineDiscovery(results);
        
        // 4. DNS Wildcard Resolution
        await this.wildcardResolution(results);
        
        // 5. Reverse DNS Lookup
        await this.reverseDnsLookup(results);
        
        return Array.from(new Set(results)).filter(subdomain => 
            subdomain !== this.domain && 
            subdomain.endsWith(this.domain)
        );
    }

    async dnsBruteforce(results) {
        const commonPrefixes = [
            'www', 'mail', 'ftp', 'blog', 'admin', 'test', 'dev', 'staging', 
            'api', 'portal', 'shop', 'store', 'crm', 'backup', 'old', 'new'
        ];
        
        for (const prefix of commonPrefixes) {
            const subdomain = `${prefix}.${this.domain}`;
            try {
                await dns.promises.resolve(subdomain);
                results.push(subdomain);
            } catch (error) {
                // Ignore unresolved domains
            }
        }
    }

    async certTransparencyLogs(results) {
        try {
            const response = await axios.get(
                `https://crt.sh/?q=%25.${this.domain}&output=json`
            );
            
            const subdomains = response.data.map(entry => entry.name_value)
                .filter(name => name !== '*' && name.includes(this.domain))
                .map(name => name.split(',')[0]);
            
            results.push(...subdomains);
        } catch (error) {
            console.error('Certificate transparency lookup failed:', error.message);
        }
    }

    async searchEngineDiscovery(results) {
        try {
            const response = await axios.get(
                `https://www.bing.com/search?q=site:${this.domain}`
            );
            
            // Parse HTML to extract subdomains (simplified example)
            const matches = response.data.match(/(?:https?:\/\/)([\w.-]+\.[\w.-]+)/g);
            if (matches) {
                const subdomains = matches
                    .filter(url => url.includes(this.domain))
                    .map(url => new URL(url).hostname);
                
                results.push(...subdomains);
            }
        } catch (error) {
            console.error('Search engine discovery failed:', error.message);
        }
    }

    async wildcardResolution(results) {
        try {
            const response = await dns.promises.resolve('*', 'A', { family: 4 });
            if (response.length > 0) {
                results.push(`*.${this.domain}`);
            }
        } catch (error) {
            // Ignore if no wildcard exists
        }
    }

    async reverseDnsLookup(results) {
        try {
            const ipAddresses = await dns.promises.resolve(this.domain, 'A');
            
            for (const ipAddress of ipAddresses) {
                const hostnames = await dns.promises.reverse(ipAddress);
                results.push(...hostnames);
            }
        } catch (error) {
            console.error('Reverse DNS lookup failed:', error.message);
        }
    }
}

module.exports = SubdomainFinder;
