#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/netfilter.h>
#include <linux/netfilter_ipv4.h>
#include <linux/skbuff.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/udp.h>
#include <linux/inet.h>
#include <linux/list.h>
#include <linux/slab.h>


MODULE_LICENSE("GPL");
MODULE_AUTHOR("Yehu Raccah");


//--------------LIST OF BLOCKED IPS----------------
struct blocked_ip{
    __be32 ip;
    struct list_head list;
};

static LIST_HEAD(blocked_ip_list);

static void add_blocked_ip(const char *ip_str, struct list_head *list){
    struct blocked_ip *node;

    node = kmalloc(sizeof(*node), GFP_KERNEL);
    if (!node){
        return;
    }
    
    node->ip = in_aton(ip_str);
    list_add(&node->list, list);
};

//--------------LIST OF BLOCKED PORTS----------------
struct blocked_port{
    u16 port;
    struct list_head list;
};

static LIST_HEAD(blocked_port_list);

static void add_blocked_port(const u16 port, struct list_head *list){
    struct blocked_port *node;

    node = kmalloc(sizeof(*node), GFP_KERNEL);
    if (!node){
        return;
    }
    
    node->port = port;
    list_add(&node->list, list);
};

//--------------FREE MEMORY FOR DATA STRUCTURES----------------

static void free_lists(void){
    struct blocked_ip *ip_node, *ip_tmp;
    struct blocked_port *port_node, *port_tmp;

    list_for_each_entry_safe(ip_node, ip_tmp, &blocked_ip_list, list){
        list_del(&ip_node->list);
        kfree(ip_node);
    }

    list_for_each_entry_safe(port_node, port_tmp, &blocked_port_list, list){
        list_del(&port_node->list);
        kfree(port_node);
    }
};


//---------------NETFILTER HOOKS----------------
static unsigned int hook_func(void *priv, struct sk_buff *skb, const struct nf_hook_state *state){
    struct iphdr *ip_header;
    struct blocked_ip *ip_node;
    struct blocked_port *port_node;

    if(!skb){
        return NF_ACCEPT;
    }

    ip_header = ip_hdr(skb);
    if(!ip_header){
        printk(KERN_INFO "NETFILTER: NO IP HEADERS\n");
        return NF_ACCEPT;
    }
    __be32 src_ip = ip_header->saddr;
    __be32 dest_ip = ip_header->daddr;

    //--------drop ips---------
    list_for_each_entry(ip_node, &blocked_ip_list, list){
        if(src_ip == ip_node->ip || dest_ip == ip_node->ip){
            printk(KERN_INFO "NETFILTER: Packet from ip: %pI4 to ip: %pI4 DROPPED!\n", &src_ip, &dest_ip);
            return NF_DROP;
        }
    }

    //--------drop ports---------
    if(ip_header->protocol == IPPROTO_TCP){
        struct tcphdr *tcp_header = tcp_hdr(skb);

        u16 src_port = ntohs(tcp_header->source);
        u16 dest_port = ntohs(tcp_header->dest);

        list_for_each_entry(port_node, &blocked_port_list, list){
            if(src_port == port_node->port || dest_port == port_node->port){
                printk(KERN_INFO "NETFILTER: Packet from port: %u to port: %u DROPPED!\n", src_port, dest_port);
                return NF_DROP;
            }
        }

    }

    if(ip_header->protocol == IPPROTO_UDP){
        struct udphdr *udp_header = udp_hdr(skb);

        u16 src_port = ntohs(udp_header->source);
        u16 dest_port = ntohs(udp_header->dest);

        list_for_each_entry(port_node, &blocked_port_list, list){
            if(src_port == port_node->port || dest_port == port_node->port){
                printk(KERN_INFO "NETFILTER: Packet from port: %u to port: %u DROPPED!\n", &src_port, &dest_port);
                return NF_DROP;
            }
        }
    }

    printk(KERN_INFO "NETFILTER: Packet from: %pI4 to: %pI4 accepted\n", &src_ip, &dest_ip);
    return NF_ACCEPT;
};

static struct nf_hook_ops my_nho = {
    .hook = hook_func,
    .pf = PF_INET,
    .hooknum = NF_INET_PRE_ROUTING,
    .priority = NF_IP_PRI_FIRST,
};


//---------------MODULE INIT/EXIT--------------------
static int __init my_init(void){
    nf_register_net_hook(&init_net, &my_nho);

    // add_blocked_ip("127.0.0.1", &blocked_ip_list);
    add_blocked_ip("8.8.8.8", &blocked_ip_list);
    add_blocked_port(200, &blocked_port_list);
    add_blocked_port(334, &blocked_port_list);

    printk(KERN_INFO "NETFILTER: hook registered\n");
    return 0;
};

static void __exit my_exit(void){

    printk(KERN_INFO "NETFILTER: hook unregistered\n");
    nf_unregister_net_hook(&init_net, &my_nho);

    free_lists();

};


module_init(my_init);
module_exit(my_exit);