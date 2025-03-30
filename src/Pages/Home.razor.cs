
using System.Text.Json;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace ExampleList.Pages;

class Test
{
    public int rank{ get; set; }
    public String company{ get; set; }
    public double revenues{ get; set; }
    public double profits{ get; set; }
}

public partial class Home : IAsyncDisposable
{
    ElementReference gridElement;
    private IJSObjectReference? module;
    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    private Test[] Data = new Test[]{
            new(){ rank= 1, company= "Exxon Mobil", revenues= 339938.0, profits= 36130.0 },
            new(){ rank= 2, company= "Wal-Mart Stores", revenues= 315654.0, profits= 11231.0 },
            new(){ rank= 3, company= "Royal Dutch Shell", revenues= 306731.0, profits= 25311.0 },
            new(){ rank= 4, company= "BP", revenues= 267600.0, profits= 22341.0 },
            new(){ rank= 5, company= "General Motors", revenues= 192604.0, profits= -10567.0 },
            new(){ rank= 6, company= "Chevron", revenues= 189481.0, profits= 14099.0 },
            new(){ rank= 7, company= "DaimlerChrysler", revenues= 186106.3, profits= 3536.3 },
            new(){ rank= 8, company= "Toyota Motor", revenues= 185805.0, profits= 12119.6  },
            new(){ rank= 9, company= "Ford Motor", revenues= 177210.0, profits= 2024.0 },
            new(){ rank= 10, company= "ConocoPhillips", revenues= 166683.0, profits= 13529.0 },
            new(){ rank= 11, company= "General Electric", revenues= 157153.0, profits= 16353.0 },
            new(){ rank= 12, company= "Total", revenues= 152360.7, profits= 15250.0 },
            new(){ rank= 13, company= "ING Group", revenues= 138235.3, profits= 8958.9 },
            new(){ rank= 14, company= "Citigroup", revenues= 131045.0, profits= 24589.0 },
            new(){ rank= 15, company= "AXA", revenues= 129839.2, profits= 5186.5 },
            new(){ rank= 16, company= "Allianz", revenues= 121406.0, profits= 5442.4 },
            new(){ rank= 17, company= "Volkswagen", revenues= 118376.6, profits= 1391.7 },
            new(){ rank= 18, company= "Fortis", revenues= 112351.4, profits= 4896.3 },
            new(){ rank= 19, company= "Crédit Agricole", revenues= 110764.6, profits= 7434.3 },
            new(){ rank= 20, company= "American Intl. Group", revenues= 108905.0, profits= 10477.0 }
    };
    private object PQGridOption = new
    {
        width = "80%",
        height = 400,
        resizable = true,
        title = "Grid From JSON",
        showBottom = false,
        showTitle = false,
        scrollModel = new { autoFit = true },
        hoverMode = "row"
    };

    protected override async Task OnInitializedAsync()
    {
        module = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "./Pages/Home.razor.js");
        await module.InvokeVoidAsync("initializePQGrid", gridElement, Data, PQGridOption);
    }
    // protected async Task OnAfterRenderAsync()
    // {
    // }

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
        if (module is not null)
        {
            await module.DisposeAsync();
        }
    }
}
